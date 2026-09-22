import { describe, expect, it } from "vitest";

import type { UserCartItem } from "@entities/cart";
import { act, renderHook } from "@testing-library/react";

import { useCartSelection } from "./useCartSelection";

const line = (overrides: Partial<UserCartItem>): UserCartItem => ({
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

// cartItemId 와 productVariantId 를 다르게 둔다 — 같으면 라인 키가 어느 쪽인지
// 이 파일의 어떤 단언도 구분하지 못한다.
const items = [
  line({ cartItemId: 1, productVariantId: 101 }),
  line({ cartItemId: 2, productVariantId: 102 }),
  line({ cartItemId: 3, productVariantId: 103 }),
];

describe("useCartSelection", () => {
  it("기본값은 전체 선택이다", () => {
    const { result } = renderHook(() => useCartSelection(items));

    expect(result.current.selectedCount).toBe(3);
    expect(result.current.allSelected).toBe(true);
  });

  it("고른 것만 해제된다", () => {
    const { result } = renderHook(() => useCartSelection(items));

    act(() => result.current.toggle(102, false));

    expect(result.current.isSelected(102)).toBe(false);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.someSelected).toBe(true);
  });

  describe("품절 라인", () => {
    const unselectable = new Set([102]);

    it("처음부터 선택에서 빠진다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, unselectable),
      );

      expect(result.current.isSelected(102)).toBe(false);
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

      expect(result.current.isSelected(102)).toBe(false);
      expect(result.current.selectedCount).toBe(2);
    });

    it("전부 품절이면 고를 것이 없다", () => {
      const { result } = renderHook(() =>
        useCartSelection(items, new Set([101, 102, 103])),
      );

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.allSelected).toBe(false);
      expect(result.current.someSelected).toBe(false);
    });
  });

  it("라인이 새 cartItemId 로 다시 담겨도 선택 상태가 유지된다", () => {
    // 삭제 되돌리기는 곧 재담기라 서버가 새 cartItemId 를 매긴다. 라인 키가 SKU 이므로
    // 같은 라인으로 인식되어야 한다.
    const before = [line({ cartItemId: 1, productVariantId: 101 })];
    const after = [line({ cartItemId: 99, productVariantId: 101 })];

    const { result, rerender } = renderHook(
      ({ items }) => useCartSelection(items),
      {
        initialProps: { items: before },
      },
    );

    act(() => result.current.toggle(101, false));
    expect(result.current.selectedCount).toBe(0);

    rerender({ items: after });
    expect(result.current.selectedCount).toBe(0);
  });
});
