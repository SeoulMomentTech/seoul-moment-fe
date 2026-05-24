"use client";

import { useEffect } from "react";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { useCreateUserRecentMutation } from "../../api/useCreateUserRecentMutation";

interface UseTrackRecentProductArgs {
  productId: number;
}

export function useTrackRecentProduct({
  productId,
}: UseTrackRecentProductArgs) {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useUserAuthStore((s) => s.hasHydrated);
  const { mutate } = useCreateUserRecentMutation();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) return;
    if (!productId) return;
    mutate(productId);
  }, [hasHydrated, isAuthenticated, productId, mutate]);
}
