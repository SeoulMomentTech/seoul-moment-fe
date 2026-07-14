"use client";

import type { PropsWithChildren } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "./query/queryClient";

export function ReactQueryProvider({ children }: PropsWithChildren) {
  // 브라우저에서는 getQueryClient()가 싱글톤을 반환하므로 리렌더 간 인스턴스가 안정적이다.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
