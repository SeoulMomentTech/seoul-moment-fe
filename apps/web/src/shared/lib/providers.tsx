"use client";

import type { ReactNode } from "react";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

interface ProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
  mutationCache: new MutationCache({
    onError: (err, _var, _ctx, mutation) => {
      if (mutation.meta?.logError) {
        // track error
        console.error(err.message);
      }
    },
  }),
});

export function ReactQueryProvider({ children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
