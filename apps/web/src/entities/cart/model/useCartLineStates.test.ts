import { describe, expect, it } from "vitest";

import {
  findCartLineState,
  isCartLineLowStock,
  isCartLineUnavailable,
  LOW_STOCK_THRESHOLD,
  type CartLineServerState,
} from "./useCartLineStates";

const state = (
  over: Partial<CartLineServerState> = {},
): CartLineServerState => ({
  stockQuantity: 5,
  isSoldOut: false,
  isAvailable: true,
  ...over,
});

describe("findCartLineState", () => {
  const states = new Map([[10, state()]]);

  it("cartItemId 로 서버 상태를 찾는다", () => {
    expect(findCartLineState(states, 10)?.stockQuantity).toBe(5);
  });

  // 서버 담기가 실패했거나 아직 응답 전인 라인.
  it("cartItemId 가 없으면 undefined", () => {
    expect(findCartLineState(states, undefined)).toBeUndefined();
    expect(findCartLineState(states, 999)).toBeUndefined();
  });
});

describe("isCartLineUnavailable", () => {
  it("품절이면 살 수 없다", () => {
    expect(isCartLineUnavailable(state({ isSoldOut: true }))).toBe(true);
  });

  // 품절 외의 사유(판매중지 등)도 서버가 합계에서 뺀다.
  it("isAvailable 이 false 면 살 수 없다", () => {
    expect(isCartLineUnavailable(state({ isAvailable: false }))).toBe(true);
  });

  it("둘 다 아니면 살 수 있다", () => {
    expect(isCartLineUnavailable(state())).toBe(false);
  });

  // 모른다는 이유로 품절 처리하면 멀쩡한 라인이 회색이 된다.
  it("서버에 짝이 없으면 막지 않는다", () => {
    expect(isCartLineUnavailable(undefined)).toBe(false);
  });
});

describe("isCartLineLowStock", () => {
  it("임계치보다 적으면 알린다", () => {
    expect(isCartLineLowStock(state({ stockQuantity: 2 }))).toBe(true);
  });

  it("임계치 이상이면 알리지 않는다", () => {
    expect(
      isCartLineLowStock(state({ stockQuantity: LOW_STOCK_THRESHOLD })),
    ).toBe(false);
  });

  // 품절은 별도 표기다. 둘 다 뜨면 "품절 · 0개 남음" 처럼 모순돼 보인다.
  it("품절 라인은 재고 임박으로 보지 않는다", () => {
    expect(
      isCartLineLowStock(state({ stockQuantity: 0, isSoldOut: true })),
    ).toBe(false);
    expect(
      isCartLineLowStock(state({ stockQuantity: 1, isAvailable: false })),
    ).toBe(false);
  });

  it("서버에 짝이 없으면 알릴 근거가 없다", () => {
    expect(isCartLineLowStock(undefined)).toBe(false);
  });
});
