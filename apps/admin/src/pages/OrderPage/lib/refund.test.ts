import type { AdminOrderId } from "@shared/services/order";
import type {
  AdminInvoiceAdjustStatus,
  AdminRefund,
  AdminRefundId,
} from "@shared/services/refund";
import { describe, expect, it } from "vitest";

import {
  canCancelRefund,
  canCompleteRefundManually,
  canRetryInvoiceAdjustment,
  canRunRefund,
  canWithdrawCancelRequest,
} from "./refund";

const refund = (overrides: Partial<AdminRefund> = {}): AdminRefund => ({
  refundId: 7 as AdminRefundId,
  orderId: 481 as AdminOrderId,
  method: "LINE_PAY",
  amount: 3880,
  status: "REQUESTED",
  isManual: false,
  reason: null,
  pgRefundId: null,
  attemptCount: 1,
  failureCode: null,
  failureMessage: null,
  adminId: 3,
  requestedAt: "2026-11-25T06:02:00Z",
  completedAt: null,
  ...overrides,
});

const adjustment = (adjustStatus: AdminInvoiceAdjustStatus) => ({
  invoiceStatus: "ISSUED" as const,
  invoiceNo: "LY74004967",
  adjustStatus,
  allowanceNo: null,
  adjustedAt: null,
  attemptCount: 0,
  failureCode: null,
  failureMessage: null,
});

const state = (
  overrides: Partial<Parameters<typeof canRunRefund>[0]> = {},
): Parameters<typeof canRunRefund>[0] => ({
  refund: null,
  refundableAmount: 3880,
  invoiceAdjustment: null,
  cancellation: {
    requestedAt: null,
    reason: null,
    withinQuickCancelPeriod: null,
  },
  ...overrides,
});

describe("canRunRefund", () => {
  it("돌려줄 금액이 남았으면 새 환불을 시작할 수 있다", () => {
    expect(canRunRefund(state())).toBe(true);
  });

  it("전액 환불이 끝났으면 막는다", () => {
    expect(
      canRunRefund(
        state({
          refund: refund({ status: "COMPLETED" }),
          refundableAmount: 0,
        }),
      ),
    ).toBe(false);
  });

  it("남은 금액이 없어도 끝나지 않은 환불은 재시도할 수 있다", () => {
    expect(
      canRunRefund(
        state({
          refund: refund({ status: "PROCESSING" }),
          refundableAmount: 0,
        }),
      ),
    ).toBe(true);
  });
});

describe("canCompleteRefundManually", () => {
  it("수동 환불은 완료를 입력할 수 있다", () => {
    expect(
      canCompleteRefundManually(state({ refund: refund({ isManual: true }) })),
    ).toBe(true);
  });

  it("PG 가 거절했거나 한 번도 보내지 못한 환불도 된다", () => {
    expect(
      canCompleteRefundManually(
        state({ refund: refund({ status: "FAILED" }) }),
      ),
    ).toBe(true);
    expect(
      canCompleteRefundManually(state({ refund: refund({ attemptCount: 0 }) })),
    ).toBe(true);
  });

  it("결과 미확인(PROCESSING)은 이중 환불을 막으려고 막는다", () => {
    expect(
      canCompleteRefundManually(
        state({ refund: refund({ status: "PROCESSING", isManual: true }) }),
      ),
    ).toBe(false);
  });

  it("PG 에 보낸 뒤 응답을 기다리는 요청 환불은 막는다", () => {
    expect(canCompleteRefundManually(state({ refund: refund() }))).toBe(false);
  });
});

describe("canCancelRefund", () => {
  it("돈이 나가지 않은 REQUESTED · FAILED 만 취소할 수 있다", () => {
    expect(canCancelRefund(state({ refund: refund() }))).toBe(true);
    expect(
      canCancelRefund(state({ refund: refund({ status: "FAILED" }) })),
    ).toBe(true);
    expect(
      canCancelRefund(state({ refund: refund({ status: "PROCESSING" }) })),
    ).toBe(false);
    expect(
      canCancelRefund(state({ refund: refund({ status: "COMPLETED" }) })),
    ).toBe(false);
  });
});

describe("canRetryInvoiceAdjustment", () => {
  it("정정이 실패·대기로 남았을 때만", () => {
    expect(
      canRetryInvoiceAdjustment(
        state({ invoiceAdjustment: adjustment("FAILED") }),
      ),
    ).toBe(true);
    expect(
      canRetryInvoiceAdjustment(
        state({ invoiceAdjustment: adjustment("PENDING") }),
      ),
    ).toBe(true);
    expect(
      canRetryInvoiceAdjustment(
        state({ invoiceAdjustment: adjustment("VOIDED") }),
      ),
    ).toBe(false);
    expect(canRetryInvoiceAdjustment(state())).toBe(false);
  });
});

describe("canWithdrawCancelRequest", () => {
  const requested = {
    requestedAt: "2026-11-25T06:02:00Z",
    reason: "尺寸選錯了",
    withinQuickCancelPeriod: true,
  };

  it("접수가 있고 끝나지 않은 환불이 없으면 철회할 수 있다", () => {
    expect(canWithdrawCancelRequest(state({ cancellation: requested }))).toBe(
      true,
    );
  });

  it("자동 환불이 진행 중이면 먼저 환불 요청을 취소해야 한다", () => {
    expect(
      canWithdrawCancelRequest(
        state({ cancellation: requested, refund: refund({ adminId: null }) }),
      ),
    ).toBe(false);
  });

  it("접수가 없으면 막는다", () => {
    expect(canWithdrawCancelRequest(state())).toBe(false);
  });
});
