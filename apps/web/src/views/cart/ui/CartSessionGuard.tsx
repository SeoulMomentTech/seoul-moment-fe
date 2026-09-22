"use client";

import { useEffect, useRef } from "react";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";

import { useRouter } from "@/i18n/navigation";

/**
 * 회원으로 `/cart` 를 보던 중 인증이 끊기면 로그인으로 보낸다.
 *
 * `AuthOnly` 를 걷어낸 뒤로 이 화면에는 로그인 게이트가 없다 — 인증을 잃은 회원은
 * `useCartSource` 가 곧바로 게스트로 읽어, 서버에는 카트가 그대로인 채 "장바구니가
 * 비었습니다"만 보인다(그 브라우저에 살아 있는 guestId 가 있으면 남의 카트로 보이기까지
 * 한다). 401 을 만난 refresh token 이 죽어 있으면(`shared/services/index.ts`) 아무 데도
 * 보내지 않고 `logout()` 만 부르므로, 여기서 그 전환을 직접 잡는다.
 *
 * `GlobalQueryHandler` 가 캐시를 지우려고 지켜보는 것과 같은 authenticated →
 * unauthenticated 전환이다. 원인(세션 만료 vs 의도된 로그아웃)을 가리지 않는 것도
 * 같다 — 이전의 `AuthOnly` 도 원인을 가리지 않고 비인증이면 무조건 리다이렉트했다.
 */
export function CartSessionGuard() {
  const router = useRouter();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useUserAuthHydrated();

  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (hasHydrated && wasAuthenticated.current && !isAuthenticated) {
      router.replace("/login");
    }

    wasAuthenticated.current = isAuthenticated;
  }, [hasHydrated, isAuthenticated, router]);

  return null;
}
