"use client";

import { useCartStore } from "./useCartStore";
import { useUserCartCountQuery } from "../api/useUserCart";

/**
 * 헤더 배지에 찍을 라인 수.
 *
 * 값의 근거는 서버(`GET user/cart/count`)다 — 다른 기기에서 담은 것까지 세어야 하고,
 * 로컬은 이 브라우저가 본 것만 안다.
 *
 * 다만 **응답 전과 실패 시에는 로컬 라인 수로 버틴다**. 그 사이 0 을 그리면 새로고침마다
 * 배지가 사라졌다 나타난다. 로컬 쓰기는 `useCart` 가 서버에도 흘리므로 두 값은 곧 만난다.
 */
export const useCartBadgeCount = () => {
  const localCount = useCartStore((state) => state.lines.length);
  const hasCartHydrated = useCartStore((state) => state.hasHydrated);

  const { data, isSuccess } = useUserCartCountQuery();

  return {
    count: isSuccess ? data.count : localCount,
    /**
     * 서버가 답하기 전에는 로컬을 쓰므로 rehydrate 를 기다려야 한다. SSR 은 항상 0 으로
     * 그리기 때문에 그대로 두면 hydration 불일치가 난다.
     */
    isReady: hasCartHydrated || isSuccess,
  };
};
