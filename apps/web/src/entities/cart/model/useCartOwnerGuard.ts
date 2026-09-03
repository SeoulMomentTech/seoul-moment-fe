"use client";

import { useEffect } from "react";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";

import { useCartStore } from "./useCartStore";

/**
 * 계정이 바뀌면 장바구니를 비운다.
 *
 * 저장은 로컬인데 접근은 로그인 필수라, 다른 계정으로 로그인했을 때 이전 사용자의 장바구니가
 * 보이면 안 된다. 항상 마운트되어 있는 헤더에서 한 번 호출한다.
 *
 * **로그아웃만으로는 비우지 않는다** — 같은 계정으로 다시 로그인하면 담아둔 것이 살아있어야 한다.
 * 오직 `ownerId` 와 다른 **다른 계정**이 로그인할 때만 비운다.
 *
 * `GlobalQueryHandler`(shared) 에 넣는 방법은 쓰지 않는다 — shared 가 entities 를 import 하는
 * FSD 역방향 위반이다.
 */
export const useCartOwnerGuard = () => {
  const userId = useUserAuthStore((state) => state.id);
  const hasAuthHydrated = useUserAuthHydrated();
  const hasCartHydrated = useCartStore((state) => state.hasHydrated);

  useEffect(
    function guardCartOwner() {
      // 두 스토어가 모두 rehydrate 되기 전에는 판단할 수 없다.
      // 섣불리 비우면 새로고침마다 장바구니가 날아간다.
      if (!hasAuthHydrated || !hasCartHydrated) return;
      // 로그아웃 상태에서는 건드리지 않는다 (같은 계정 재로그인 시 유지)
      if (userId === 0) return;

      const { ownerId, clear, setOwner } = useCartStore.getState();

      if (ownerId === userId) return;
      if (ownerId !== 0) clear();

      setOwner(userId);
    },
    [userId, hasAuthHydrated, hasCartHydrated],
  );
};
