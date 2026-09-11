"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useUserCartCountQuery } from "../api/useUserCart";

/**
 * 헤더 배지에 찍을 라인 수.
 *
 * 값의 근거는 서버(`GET user/cart/count`)다 — 다른 기기에서 담은 것까지 세어야 한다.
 *
 * 응답 전에도 깜박이지 않는 이유는 이 쿼리 캐시가 localStorage 에 남아 복원되기 때문이다.
 * 복원이 끝나기 전에는 아직 아무것도 모르므로 `isReady` 가 false 다 — 그 값은 서버와
 * 클라이언트 첫 렌더가 같아서 hydration 불일치가 나지 않는다.
 */
export const useCartBadgeCount = () => {
  const isRestoring = useIsRestoring();
  const { data } = useUserCartCountQuery();

  return {
    count: data?.count ?? 0,
    isReady: !isRestoring && data != null,
  };
};
