
import type { AdminOrderId } from "@shared/services/order";
import type {
  AdminInvoiceAdjustStatus,
  AdminRefundId,
  AdminRefundListItem,
} from "@shared/services/refund";
import { describe, expect, it } from "vitest";

import { getRefundRowAction } from "./rowAction";

const row = (
  overrides: Partial<AdminRefundListItem> = {},
  adjustStatus: AdminInvoiceAdjustStatus | null = "NONE",
): AdminRefundListItem => ({
  refundId: 7 as AdminRefundId,
  orderId: 481 as AdminOrderId,
  method: "LINE_PAY",
  amount: 3880,
  status: "COMPLETED",
  isManual: false,
  reason: null,
  pgRefundId: null,
  attemptCount: 1,
  failureCode: null,
  failureMessage: null,
  adminId: 3,
  requestedAt: "2026-11-25T06:02:00Z",
  completedAt: "2026-11-25T06:03:00Z",
  orderNumber: "SM-20261123-000481",
  recipientName: "李佳蓉",
  cancellationRequestedAt: null,
  invoiceAdjustment:
    adjustStatus === null
      ? null
      : {
          invoiceStatus: "ISSUED",
          invoiceNo: "LY74004967",
          adjustStatus,
          allowanceNo: null,
          adjustedAt: null,
          attemptCount: 0,
          failureCode: null,
          failureMessage: null,
        },
  ...overrides,
});

describe("getRefundRowAction", () => {
  it("수동 환불 요청은 완료 입력", () => {
    expect(
      getRefundRowAction(row({ status: "REQUESTED", isManual: true })),
    ).toBe("complete");
  });

  it("PG 로 보낼 요청 환불은 버튼이 없다", () => {
    expect(getRefundRowAction(row({ status: "REQUESTED" }))).toBeNull();
  });

  it("실패·결과 미확인은 환불 재시도", () => {
    expect(getRefundRowAction(row({ status: "FAILED" }))).toBe("retry");
    expect(getRefundRowAction(row({ status: "PROCESSING" }))).toBe("retry");
  });

  it("환불은 끝났는데 정정이 실패·대기면 정정만 다시", () => {
    expect(getRefundRowAction(row({}, "FAILED"))).toBe("invoiceAdjust");
    expect(getRefundRowAction(row({}, "PENDING"))).toBe("invoiceAdjust");
  });

  it("환불·정정이 다 끝났거나 발표가 없으면 버튼이 없다", () => {
    expect(getRefundRowAction(row({}, "VOIDED"))).toBeNull();
    expect(getRefundRowAction(row({}, null))).toBeNull();
  });
});
