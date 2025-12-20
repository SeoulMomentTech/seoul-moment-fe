"use client";

import type { PropsWithChildren } from "react";

import { toast } from "sonner";

import * as Sentry from "@sentry/nextjs";
import type { ExtendedHTTPError } from "@shared/services";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
  queryCache: new QueryCache({
    onError: (err, query) => {
      if (!(err as ExtendedHTTPError).isReported) {
        Sentry.withScope((scope) => {
          scope.setTag("type", "query");
          scope.setContext("Query Info", {
            queryKey: query.queryKey,
          });
          Sentry.captureException(err);
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _var, _ctx, mutation) => {
      if (mutation.meta?.logError) {
        // track error
        console.error(err.message);

        // 이미 ky의 beforeErrorHandler 등에서 처리된 에러가 아닌 경우 Sentry 전송
        if (!(err as ExtendedHTTPError).isReported) {
          Sentry.withScope((scope) => {
            scope.setTag("type", "mutation");
            scope.setContext("Mutation Info", {
              mutationKey: mutation.options.mutationKey,
            });
            Sentry.captureException(err);
          });
        }
      }

      if (mutation.meta?.showToast) {
        toast.error(err.message);
      }
    },
  }),
});

export function ReactQueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
