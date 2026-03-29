import type { PropsWithChildren } from "react";

import { handleAppQueryError } from "@shared/utils/query-error-handler";
import { Toaster } from "sonner";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
  },
  queryCache: new QueryCache({
    onError: (err, query) => handleAppQueryError(err, query.meta),
  }),
  mutationCache: new MutationCache({
    onError: (err, _variables, _context, mutation) =>
      handleAppQueryError(err, mutation.meta),
  }),
});

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster closeButton position="top-right" richColors />
    </QueryClientProvider>
  );
}
