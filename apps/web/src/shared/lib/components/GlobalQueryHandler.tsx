"use client";

import { useEffect } from "react";

import useClearAllQueries from "../hooks/useClearAllQueries";
import { useUserAuthStore } from "../hooks/useUserAuthStore";

export default function GlobalQueryHandler() {
  const { clearAllQueries } = useClearAllQueries();
  const { isAuthenticated } = useUserAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllQueries();
    }
  }, [isAuthenticated, clearAllQueries]);

  return null;
}
