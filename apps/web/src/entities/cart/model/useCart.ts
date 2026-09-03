"use client";

import { useCartStore } from "./useCartStore";

/**
 * 장바구니에 접근하는 **유일한 경계**.
 *
 * UI 컴포넌트는 `useCartStore` 를 직접 import 하지 않는다. 나중에 `user/cart` API 가 생기면
 * 이 훅 내부만 `useAppQuery` / `useAppMutation` 으로 갈아끼우고 컴포넌트는 손대지 않는다.
 */
export const useCart = () => {
  const lines = useCartStore((state) => state.lines);
  const isHydrated = useCartStore((state) => state.hasHydrated);

  const addLines = useCartStore((state) => state.addLines);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLines = useCartStore((state) => state.removeLines);
  const restoreLines = useCartStore((state) => state.restoreLines);
  const clear = useCartStore((state) => state.clear);

  return {
    lines,
    isHydrated,
    /** 헤더 배지에 쓰는 값 — 라인 개수(수량 합이 아니다) */
    lineCount: lines.length,
    addLines,
    updateQuantity,
    removeLines,
    restoreLines,
    clear,
  };
};
