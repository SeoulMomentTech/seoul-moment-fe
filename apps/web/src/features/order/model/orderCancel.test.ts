import { describe, expect, it } from "vitest";

import {
  getCancelNotice,
  isPartialRefund,
  showsCancelSection,
} from "./orderCancel";

const refund = (
  status: "REQUESTED" | "COMPLETED" | "FAILED",
  amount = 1000,
) => ({
  status,
  amount,
  requestedAt: "2026-11-26T01:00:00.000Z",
});

describe("showsCancelSection", () => {
  it("신청도 환불도 없으면 숨긴다", () => {
    expect(
      showsCancelSection({
        cancellationRequestedAt: null,
        refund: null,
        refundedAmount: 0,
      }),
    ).toBe(false);
  });

  it("신청했거나 환불이 있으면 보인다", () => {
    expect(
      showsCancelSection({
        cancellationRequestedAt: "2026-11-26T01:00:00.000Z",
        refund: null,
        refundedAmount: 0,
      }),
    ).toBe(true);
    // 관리자가 신청 없이 부분 환불한 주문
    expect(
      showsCancelSection({
        cancellationRequestedAt: null,
        refund: refund("COMPLETED"),
        refundedAmount: 1000,
      }),
    ).toBe(true);
  });
});

describe("isPartialRefund", () => {
  it("결제 금액보다 적으면 부분 환불이다", () => {
    expect(
      isPartialRefund({ refund: refund("COMPLETED", 500), totalAmount: 1000 }),
    ).toBe(true);
    expect(
      isPartialRefund({ refund: refund("COMPLETED", 1000), totalAmount: 1000 }),
    ).toBe(false);
    expect(isPartialRefund({ refund: null, totalAmount: 1000 })).toBe(false);
  });
});

describe("getCancelNotice", () => {
  const requestedAt = "2026-11-26T01:00:00.000Z";

  it("환불 상태에 따라 안내를 고른다", () => {
    expect(
      getCancelNotice({
        cancellationRequestedAt: requestedAt,
        refund: refund("FAILED"),
        refundedAmount: 0,
      }),
    ).toBe("delayed");
    expect(
      getCancelNotice({
        cancellationRequestedAt: requestedAt,
        refund: refund("COMPLETED"),
        refundedAmount: 1000,
      }),
    ).toBe("card");
    expect(
      getCancelNotice({
        cancellationRequestedAt: requestedAt,
        refund: refund("REQUESTED"),
        refundedAmount: 0,
      }),
    ).toBeNull();
  });

  it("신청만 되고 환불 전이면 접수 안내다", () => {
    expect(
      getCancelNotice({
        cancellationRequestedAt: requestedAt,
        refund: null,
        refundedAmount: 0,
      }),
    ).toBe("received");
  });
});
