"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useCartSource } from "../api/useCartSource";
import { useGuestCartCountQuery } from "../api/useGuestCart";
import { useUserCartCountQuery } from "../api/useMemberCart";

/**
 * 헤더 배지에 찍을 라인 수.
 *
 * 값의 근거는 서버다 — 회원은 다른 기기에서 담은 것까지 세어야 하고, 게스트는 담은 적이
 * 없으면 요청 없이 0 이다.
 *
 * 응답 전에도 깜박이지 않는 이유는 이 쿼리 캐시가 localStorage 에 남아 복원되기 때문이다.
 * 복원이 끝나기 전에는 아직 아무것도 모르므로 `isReady` 가 false 다 — 그 값은 서버와
 * 클라이언트 첫 렌더가 같아서 hydration 불일치가 나지 않는다.
 */
export const useCartBadgeCount = () => {
  const isRestoring = useIsRestoring();
  const source = useCartSource();

  const member = useUserCartCountQuery();
  const guest = useGuestCartCountQuery(
    source?.kind === "guest" ? source.guestId : null,
  );

  // 아직 어느 카트인지 모르면 숫자를 말하지 않는다.
  if (!source) return { count: 0, isReady: false };

  const data = source.kind === "member" ? member.data : guest.data;

  return {
    count: data?.count ?? 0,
    isReady: !isRestoring && data != null,
  };
};
