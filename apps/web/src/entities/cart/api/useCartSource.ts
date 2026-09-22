"use client";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";

import { resolveCartSource, type CartSource } from "../model/cartSource";
import { useGuestCartId, useGuestCartIdHydrated } from "../model/guestId";

/** 지금 유효한 장바구니. 두 store 의 복원이 끝나기 전에는 `null` 이다 */
export const useCartSource = (): CartSource | null =>
  resolveCartSource({
    hasAuthHydrated: useUserAuthHydrated(),
    isAuthenticated: useUserAuthStore((s) => s.isAuthenticated),
    hasGuestHydrated: useGuestCartIdHydrated(),
    guestId: useGuestCartId(),
  });
