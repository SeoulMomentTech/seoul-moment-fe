"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useCartCount } from "../api/useCartApi";

/**
 * 헤더 배지에 찍을 라인 수.
 *
 * 값의 근거는 서버다 — 회원은 다른 기기에서 담은 것까지 세어야 하고, 게스트는 담은 적이
 * 없으면 요청 없이 0 이다. 회원·게스트 중 무엇을 볼지는 `useCartCount`(`useCartApi.ts`)
 * 하나가 정한다 — 이 파일은 그 결과만 읽는다.
 *
 * 응답 전에도 깜박이지 않는 이유는 이 쿼리 캐시가 localStorage 에 남아 복원되기 때문이다.
 * 복원이 끝나기 전에는 아직 아무것도 모르므로 `isReady` 가 false 다 — 그 값은 서버와
 * 클라이언트 첫 렌더가 같아서 hydration 불일치가 나지 않는다.
 */
export const useCartBadgeCount = () => {
  const isRestoring = useIsRestoring();
  const { data } = useCartCount();

  return {
    count: data?.count ?? 0,
    isReady: !isRestoring && data != null,
  };
};
