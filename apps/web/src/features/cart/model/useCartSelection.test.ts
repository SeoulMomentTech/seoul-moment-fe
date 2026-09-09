import { describe, expect, it } from "vitest";

import type { CartLine } from "@entities/cart";
import { act, renderHook } from "@testing-library/react";

import { useCartSelection } from "./useCartSelection";

const line = (lineId: string): CartLine =>
  ({
    lineId,
    productId: 1,
    quantity: 1,
    addedAt: 0,
    productName: lineId,
    brandId: "1",
    brandName: "OSSMOVE",
    brandProfileImg: "",
    imageUrl: "",
    price: 1000,
    discountPrice: 0,
    options: [],
    external: [],
  }) as CartLine;

const lines = [line("a"), line("b"), line("c")];

describe("useCartSelection", () => {
  it("기본값은 전체 선택이다", () => {
    const { result } = renderHook(() => useCartSelection(lines));

    expect(result.current.selectedCount).toBe(3);
    expect(result.current.allSelected).toBe(true);
  });

  it("고른 것만 해제된다", () => {
    const { result } = renderHook(() => useCartSelection(lines));

    act(() => result.current.toggle("b", false));

    expect(result.current.isSelected("b")).toBe(false);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.someSelected).toBe(true);
  });

  describe("품절 라인", () => {
    const unselectable = new Set(["b"]);

    it("처음부터 선택에서 빠진다", () => {
      const { result } = renderHook(() =>
        useCartSelection(lines, unselectable),
      );

      expect(result.current.isSelected("b")).toBe(false);
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectableCount).toBe(2);
    });

    // 회귀 방지: 고를 수 없는 라인을 분모에 두면 전체 선택이 영원히 완료되지 않는다.
    it("전체 선택 판정의 분모에서 빠진다", () => {
      const { result } = renderHook(() =>
        useCartSelection(lines, unselectable),
      );

      expect(result.current.allSelected).toBe(true);
      expect(result.current.someSelected).toBe(false);
    });

    it("전체 선택을 눌러도 다시 들어오지 않는다", () => {
      const { result } = renderHook(() =>
        useCartSelection(lines, unselectable),
      );

      act(() => result.current.toggleAll(false));
      act(() => result.current.toggleAll(true));

      expect(result.current.isSelected("b")).toBe(false);
      expect(result.current.selectedCount).toBe(2);
    });

    it("전부 품절이면 고를 것이 없다", () => {
      const { result } = renderHook(() =>
        useCartSelection(lines, new Set(["a", "b", "c"])),
      );

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.allSelected).toBe(false);
      expect(result.current.someSelected).toBe(false);
    });
  });
});
