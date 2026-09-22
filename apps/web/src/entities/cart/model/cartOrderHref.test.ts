import { describe, expect, it } from "vitest";

import { toCartOrderCta } from "./cartOrderHref";
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

describe("toCartOrderCta", () => {
  it("고른 것이 없으면 비활성이다", () => {
    expect(
      toCartOrderCta({
        source: { kind: "member" },
        lines: [line({})],
        selectedVariantIds: new Set(),
      }),
    ).toEqual({ type: "disabled" });
  });

  it("게스트도 고른 것이 없으면 게스트 상태가 아니라 비활성이다", () => {
    // 회원은 이 케이스에서 어차피 cartItemIds 가 비어 disabled 가 나오므로, 위 테스트만으로는
    // `selectedVariantIds.size === 0` 가드가 실제로 하는 일을 확인할 수 없다 — 게스트는
    // 그 가드가 없으면 선택과 무관하게 곧장 "guest" 가 나오므로 여기서만 그 가드가 드러난다.
    expect(
      toCartOrderCta({
        source: { kind: "guest", guestId: "g-1" },
        lines: [line({ cartItemId: null })],
        selectedVariantIds: new Set(),
      }),
    ).toEqual({ type: "disabled" });
  });

  it("회원은 고른 라인의 cartItemId 로 주문서 링크를 받는다", () => {
    const cta = toCartOrderCta({
      source: { kind: "member" },
      lines: [
        line({ cartItemId: 11, productVariantId: 101 }),
        line({ cartItemId: 12, productVariantId: 102 }),
      ],
      selectedVariantIds: new Set([102]),
    });

    expect(cta.type).toBe("link");
    expect(cta).toMatchObject({ type: "link" });
    if (cta.type === "link") {
      expect(cta.href).toContain("12");
      expect(cta.href).not.toContain("11");
    }
  });

  it("고른 라인 중 하나라도 서버 id 가 없으면 비활성이다", () => {
    // 일부만 주문되면 사용자는 무엇이 빠졌는지 알 수 없다.
    expect(
      toCartOrderCta({
        source: { kind: "member" },
        lines: [
          line({ cartItemId: 11, productVariantId: 101 }),
          line({ cartItemId: null, productVariantId: 102 }),
        ],
        selectedVariantIds: new Set([101, 102]),
      }),
    ).toEqual({ type: "disabled" });
  });

  it("게스트는 무언가 고르면 로그인이 필요한 상태가 된다", () => {
    // 주문·결제는 회원 전용이다. 버튼은 활성으로 두되, 누르면 로그인이 필요하다는 토스트만
    // 띄우고 이동하지 않는다 — 요청하지 않은 로그인 화면으로 보내는 것은 이 거절에 비해
    // 과한 인터럽트다. 게스트 라인은 `cartItemId` 가 없어 주문서가 애초에 받을 수도 없다.
    expect(
      toCartOrderCta({
        source: { kind: "guest", guestId: "g-1" },
        lines: [line({ cartItemId: null })],
        selectedVariantIds: new Set([101]),
      }),
    ).toEqual({ type: "guest" });
  });

  it("아직 어느 카트인지 모르면 비활성이다", () => {
    expect(
      toCartOrderCta({
        source: null,
        lines: [line({})],
        selectedVariantIds: new Set([101]),
      }),
    ).toEqual({ type: "disabled" });
  });
});
