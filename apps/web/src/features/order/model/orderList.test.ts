import { describe, expect, it } from "vitest";

import { getExtraItemCount, showsDeliveryProgress } from "./orderList";

describe("showsDeliveryProgress", () => {
  it("결제 완료 주문만 배송 진행바를 그린다", () => {
    expect(showsDeliveryProgress("PAID")).toBe(true);
  });

  it("취소·환불 대상·입금 대기는 배지로만 보여준다", () => {
    expect(showsDeliveryProgress("CANCELED")).toBe(false);
    expect(showsDeliveryProgress("FAILED")).toBe(false);
    expect(showsDeliveryProgress("PAYMENT_WAITING")).toBe(false);
  });
});

describe("getExtraItemCount", () => {
  it("대표 상품을 뺀 나머지 라인 수", () => {
    expect(getExtraItemCount(3)).toBe(2);
  });

  it("한 건이거나 0 이면 0", () => {
    expect(getExtraItemCount(1)).toBe(0);
    expect(getExtraItemCount(0)).toBe(0);
  });
});
