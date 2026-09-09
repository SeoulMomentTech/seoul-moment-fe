import { describe, expect, it } from "vitest";

import type { UserCartItem } from "@entities/cart";
import { act, renderHook } from "@testing-library/react";

import { useCartSelection } from "./useCartSelection";

const item = (cartItemId: number): UserCartItem => ({
  cartItemId,
  productItemId: 1,
  productVariantId: cartItemId,
  productName: `item-${cartItemId}`,
  optionText: "IVORY / M",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  quantity: 1,
  totalPrice: 1000,
  stockQuantity: 50,
  isSoldOut: false,
  isAvailable: true,
});

const items = [item(1), item(2), item(3)];

describe("useCartSelection", () => {
  it("기본값은 전체 선택이다", () => {
    const { result } = renderHook(() => useCartSelection(items));

    expect(result.current.selectedCount).toBe(3);
    expect(result.current.allSelected).toBe(true);
  });

  it("고른 것만 해제된다", () => {
    const { result } = renderHook(() => useCartSelection(items));

    act(() => result.current.toggle(2, false));

    expect(result.current.isSelected(2)).toBe(false);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.someSelected).toBe(true);
  });

  describe("품절 라인", () => {
    const unselectable = new Set([2]);

    it("처음부터 선택에서 빠진다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, unselectable),
      );

      expect(result.current.isSelected(2)).toBe(false);
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectableCount).toBe(2);
    });

    // 회귀 방지: 고를 수 없는 라인을 분모에 두면 전체 선택이 영원히 완료되지 않는다.
    it("전체 선택 판정의 분모에서 빠진다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, unselectable),
      );

      expect(result.current.allSelected).toBe(true);
      expect(result.current.someSelected).toBe(false);
    });

    it("전체 선택을 눌러도 다시 들어오지 않는다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, unselectable),
      );

      act(() => result.current.toggleAll(false));
      act(() => result.current.toggleAll(true));

      expect(result.current.isSelected(2)).toBe(false);
      expect(result.current.selectedCount).toBe(2);
    });

    it("전부 품절이면 고를 것이 없다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, new Set([1, 2, 3])),
      );

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.allSelected).toBe(false);
      expect(result.current.someSelected).toBe(false);
    });
  });
});
