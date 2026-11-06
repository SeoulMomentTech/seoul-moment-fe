import { describe, expect, it } from "vitest";

import type { UserOrderItem } from "@shared/services/userOrder";

import {
  canRepay,
  ORDER_STATUS_KEY,
  toCvsStoreLabel,
  toOrderItemGroups,
} from "./orderDetail";

const item = (
  orderItemId: number,
  brandId: number,
  brandName: string,
): UserOrderItem => ({
  orderItemId,
  productItemId: orderItemId * 10,
  brandId,
  brandName,
  productName: `p${orderItemId}`,
  optionText: "블랙 / FREE",
  imageUrl: `https://img/${orderItemId}.jpg`,
  unitPrice: 1000,
  unitDiscountPrice: 900,
  quantity: 2,
  totalPrice: 1800,
});

describe("orderDetail", () => {
  it("주문 라인을 브랜드별로 묶되 처음 나온 순서를 지킨다", () => {
    const groups = toOrderItemGroups([
      item(1, 7, "MUCENT"),
      item(2, 3, "FONTESSA"),
      item(3, 7, "MUCENT"),
    ]);

    expect(groups.map((g) => g.brandName)).toEqual(["MUCENT", "FONTESSA"]);
    expect(groups[0]?.items.map((i) => i.productName)).toEqual(["p1", "p3"]);
  });

  it("주문서 라인 목록이 쓰는 필드로 옮긴다", () => {
    const [group] = toOrderItemGroups([item(1, 7, "MUCENT")]);

    expect(group?.items[0]).toMatchObject({
      productItemId: 10,
      productVariantId: 1,
      productName: "p1",
      optionText: "블랙 / FREE",
      imageUrl: "https://img/1.jpg",
      quantity: 2,
      totalPrice: 1800,
    });
  });

  it("다시 결제는 결제 전(PENDING) 주문만", () => {
    expect(canRepay("PENDING")).toBe(true);
    expect(canRepay("PAYMENT_WAITING")).toBe(false);
    expect(canRepay("PAID")).toBe(false);
    expect(canRepay("CANCELED")).toBe(false);
    expect(canRepay("FAILED")).toBe(false);
  });

  it("상태마다 문구 키가 있다", () => {
    expect(ORDER_STATUS_KEY).toEqual({
      PENDING: "order_status_pending",
      PAYMENT_WAITING: "order_status_payment_waiting",
      PAID: "order_status_paid",
      CANCELED: "order_status_canceled",
      FAILED: "order_status_failed",
    });
  });

  it("편의점 매장 라벨은 logisticsSubType 에서 체인을 읽는다", () => {
    expect(
      toCvsStoreLabel({
        logisticsSubType: "UNIMARTC2C",
        storeName: "建盛門市",
      }),
    ).toBe("7-ELEVEN 建盛門市");
    expect(
      toCvsStoreLabel({ logisticsSubType: "FAMIC2C", storeName: "信義店" }),
    ).toBe("全家 信義店");
    expect(
      toCvsStoreLabel({ logisticsSubType: "HILIFEC2C", storeName: "店" }),
    ).toBe("萊爾富 店");
    expect(toCvsStoreLabel({ storeName: "全家 信義店" })).toBe("全家 信義店");
    expect(
      toCvsStoreLabel({ logisticsSubType: "OKMARTC2C", storeName: "店" }),
    ).toBe("店");
  });
});
