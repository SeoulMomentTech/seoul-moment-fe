import type { ExtendedHTTPError } from "@shared/services";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { setupQueryAppLifecycle } from "./appLifecycle";

const logError = (type: "query" | "mutation", err: Error, key: unknown) => {
  if ((err as ExtendedHTTPError).isReported) return;
  // TODO: 에러 리포팅(Sentry 등) 도입 시 여기서 전송한다.
  console.error(`[${type}]`, key, err.message);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
  queryCache: new QueryCache({
    onError: (err, query) => {
      if (query.meta?.logError) logError("query", err, query.queryKey);
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _var, _ctx, mutation) => {
      if (mutation.meta?.logError) {
        logError("mutation", err, mutation.options.mutationKey);
      }
    },
  }),
});

setupQueryAppLifecycle();
