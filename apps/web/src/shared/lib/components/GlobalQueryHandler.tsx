"use client";

import { useEffect, useRef } from "react";

import useClearAllQueries from "../hooks/useClearAllQueries";
import { useUserAuthStore } from "../hooks/useUserAuthStore";

export default function GlobalQueryHandler() {
  const { clearAllQueries } = useClearAllQueries();
  const { isAuthenticated } = useUserAuthStore();

  const prevIsAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (prevIsAuthenticated.current && !isAuthenticated) {
      clearAllQueries();
    }
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, clearAllQueries]);

  return null;
}
