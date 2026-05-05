"use client";

import { useEffect, type PropsWithChildren } from "react";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";

import { useRouter } from "@/i18n/navigation";

interface Props extends PropsWithChildren {
  /** 인증된 사용자를 보낼 경로. 기본 "/" */
  redirectTo?: string;
}

/**
 * 로그인된 사용자의 접근을 차단하는 wrapper. login / signup / find-password
 * 처럼 게스트만 의미 있는 페이지에서 최상위에 두고 사용한다.
 *
 * 토큰이 localStorage 라 SSR / middleware 단계에서는 인증 여부를 알 수 없다.
 * 클라이언트 hydration 직후 인증 상태가 확인되면 redirectTo 로 replace 하고
 * 그 사이엔 null 을 렌더해 폼 깜박임을 막는다.
 */
export default function GuestOnly({ children, redirectTo = "/" }: Props) {
  const router = useRouter();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useUserAuthHydrated();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  if (!hasHydrated || isAuthenticated) return null;
  return <>{children}</>;
}
