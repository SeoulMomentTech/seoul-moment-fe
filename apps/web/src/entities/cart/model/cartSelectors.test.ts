import { describe, expect, it } from "vitest";

import {
  estimateShipping,
  getCartItemUnitPrice,
  isCartItemLowStock,
  isCartItemUnavailable,
  listCartItems,
  sumSelectedAmount,
} from "./cartSelectors";
import type { UserCartBrandGroup, UserCartItem } from "./types";

const item = (
  cartItemId: number,
  overrides: Partial<UserCartItem> = {},
): UserCartItem => ({
  cartItemId,
  productItemId: 1,
  productVariantId: 500 + cartItemId,
  productName: `상품 ${cartItemId}`,
  optionText: "IVORY / M",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  quantity: 1,
  totalPrice: 1000,
  stockQuantity: 50,
  isSoldOut: false,
  isAvailable: true,
  ...overrides,
});

const group = (brandId: number, items: UserCartItem[]): UserCartBrandGroup => ({
  brandId,
  brandName: `브랜드 ${brandId}`,
  brandProfileImage: "",
  items,
  productAmount: items.reduce((total, i) => total + i.totalPrice, 0),
});

describe("listCartItems", () => {
  it("브랜드 묶음을 순서대로 편다", () => {
    const groups = [group(1, [item(1), item(2)]), group(2, [item(3)])];

    expect(listCartItems(groups).map((i) => i.cartItemId)).toEqual([1, 2, 3]);
  });
});

describe("getCartItemUnitPrice", () => {
  it("유효한 할인가가 있으면 할인가를 쓴다", () => {
    expect(getCartItemUnitPrice(item(1, { discountPrice: 800 }))).toBe(800);
  });

  // 서버가 0 이나 정상가 이상을 내려줄 수 있다. 그때 할인가를 쓰면 금액이 틀어진다.
  it("할인가가 0 이거나 정상가 이상이면 정상가를 쓴다", () => {
    expect(getCartItemUnitPrice(item(1, { discountPrice: 0 }))).toBe(1000);
    expect(getCartItemUnitPrice(item(1, { discountPrice: 1200 }))).toBe(1000);
    expect(getCartItemUnitPrice(item(1, { discountPrice: undefined }))).toBe(
      1000,
    );
  });
});

describe("구매 가능 판정", () => {
  it("품절이거나 서버가 합계에서 빼는 라인은 살 수 없다", () => {
    expect(isCartItemUnavailable(item(1, { isSoldOut: true }))).toBe(true);
    expect(isCartItemUnavailable(item(1, { isAvailable: false }))).toBe(true);
    expect(isCartItemUnavailable(item(1))).toBe(false);
  });

  it("재고가 임계치 미만일 때만 남은 개수를 알린다", () => {
    expect(isCartItemLowStock(item(1, { stockQuantity: 9 }))).toBe(true);
    expect(isCartItemLowStock(item(1, { stockQuantity: 10 }))).toBe(false);
  });

  // 품절과 "2개 남음" 을 동시에 붙이면 모순돼 보인다. 품절이 우선이다.
  it("품절 라인은 저재고로 치지 않는다", () => {
    expect(
      isCartItemLowStock(item(1, { stockQuantity: 0, isSoldOut: true })),
    ).toBe(false);
  });
});

describe("sumSelectedAmount", () => {
  it("선택된 라인의 라인 금액만 더한다", () => {
    const items = [
      item(1, { totalPrice: 1000 }),
      item(2, { totalPrice: 2500 }),
      item(3, { totalPrice: 400 }),
    ];

    expect(sumSelectedAmount(items, new Set([1, 3]))).toBe(1400);
    expect(sumSelectedAmount(items, new Set())).toBe(0);
  });
});

describe("estimateShipping", () => {
  const policy = { estimatedShippingFee: 60, freeShippingThreshold: 3000 };

  it("기준액에 못 미치면 배송비가 붙고 남은 금액을 알려준다", () => {
    expect(estimateShipping({ selectedAmount: 1000, ...policy })).toEqual({
      fee: 60,
      amountToFreeShipping: 2000,
    });
  });

  it("기준액을 채우면 무료다", () => {
    expect(estimateShipping({ selectedAmount: 3000, ...policy })).toEqual({
      fee: 0,
      amountToFreeShipping: 0,
    });
  });

  // 서버가 준 값은 장바구니 전체 기준이라, 아무것도 안 고른 상태에서 그대로 쓰면
  // 합계 0 에 배송비만 붙는다.
  it("아무것도 고르지 않으면 배송비를 매기지 않는다", () => {
    expect(estimateShipping({ selectedAmount: 0, ...policy })).toEqual({
      fee: 0,
      amountToFreeShipping: 0,
    });
  });

  it("무료배송 기준이 없으면 항상 배송비가 붙는다", () => {
    expect(
      estimateShipping({
        selectedAmount: 100000,
        estimatedShippingFee: 60,
        freeShippingThreshold: 0,
      }),
    ).toEqual({ fee: 60, amountToFreeShipping: 0 });
  });
});
