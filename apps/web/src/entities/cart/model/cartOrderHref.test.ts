import { describe, expect, it } from "vitest";

import { toCartOrderHref } from "./cartOrderHref";
import type { CartLine } from "./types";

const line = (overrides: Partial<CartLine>): CartLine => ({
  cartItemId: 1,
  productItemId: 1,
  productVariantId: 101,
  productName: "상품",
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

describe("toCartOrderHref", () => {
  it("고른 것이 없으면 링크를 만들지 않는다", () => {
    expect(
      toCartOrderHref({
        source: { kind: "member" },
        lines: [line({})],
        selectedVariantIds: new Set(),
      }),
    ).toBeNull();
  });

  it("회원은 고른 라인의 cartItemId 로 주문서에 간다", () => {
    const href = toCartOrderHref({
      source: { kind: "member" },
      lines: [
        line({ cartItemId: 11, productVariantId: 101 }),
        line({ cartItemId: 12, productVariantId: 102 }),
      ],
      selectedVariantIds: new Set([102]),
    });

    expect(href).toContain("12");
    expect(href).not.toContain("11");
  });

  it("고른 라인 중 하나라도 서버 id 가 없으면 링크를 만들지 않는다", () => {
    // 일부만 주문되면 사용자는 무엇이 빠졌는지 알 수 없다.
    expect(
      toCartOrderHref({
        source: { kind: "member" },
        lines: [
          line({ cartItemId: 11, productVariantId: 101 }),
          line({ cartItemId: null, productVariantId: 102 }),
        ],
        selectedVariantIds: new Set([101, 102]),
      }),
    ).toBeNull();
  });

  it("게스트는 로그인으로 보낸다", () => {
    // 주문·결제는 회원 전용이다. 빈 주문서로 보내는 것보다 로그인이 정직하다.
    expect(
      toCartOrderHref({
        source: { kind: "guest", guestId: "g-1" },
        lines: [line({ cartItemId: null })],
        selectedVariantIds: new Set([101]),
      }),
    ).toBe("/login");
  });

  it("아직 어느 카트인지 모르면 링크를 만들지 않는다", () => {
    expect(
      toCartOrderHref({
        source: null,
        lines: [line({})],
        selectedVariantIds: new Set([101]),
      }),
    ).toBeNull();
  });
});
