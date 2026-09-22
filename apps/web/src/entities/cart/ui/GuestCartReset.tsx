"use client";

import { useEffect, useRef } from "react";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { useGuestCartIdStore } from "../model/guestId";

/**
 * 로그인하면 게스트 장바구니를 버린다.
 *
 * 서버는 게스트 카트를 회원 카트로 옮겨주지 않고, 우리도 대신 옮기지 않는다 —
 * 게스트 모듈은 심사용 임시 기능이다. 로컬 ID 만 버리면 되고 `DELETE guest/cart` 는
 * 부르지 않는다 (서버 보관이 7일이라 알아서 정리된다).
 *
 * 반대 방향(로그아웃)에서는 건드리지 않는다. 게스트로 담아둔 것이 있으면 그 카트로 돌아온다.
 *
 * `GlobalQueryHandler` 에 넣지 않은 이유는 의존 방향이다 — `shared` 가 `entities/cart` 의
 * store 를 알면 역방향 참조가 된다.
 */
export function GuestCartReset() {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const clearGuestId = useGuestCartIdStore((s) => s.clearGuestId);

  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      clearGuestId();
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, clearGuestId]);

  return null;
}
