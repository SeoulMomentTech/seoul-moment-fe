import type { PropsWithChildren } from "react";

import type { AxiosError } from "axios";
import { toast, Toaster } from "sonner";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const handleQueryError = (err: Error, meta?: Record<string, unknown>) => {
  if (meta?.toastOnError) {
    const message =
      typeof meta.toastOnError === "string"
        ? meta.toastOnError
        : (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        err.message;
    toast.error(message);
  }
};

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
    onError: (err, query) => handleQueryError(err, query.meta),
  }),
  mutationCache: new MutationCache({
    onError: (err, _variables, _context, mutation) =>
      handleQueryError(err, mutation.meta),
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
