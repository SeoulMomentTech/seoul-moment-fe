import { type PropsWithChildren, useEffect } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient, subscribeAppFocus } from "./queryClient";

export function QueryProvider({ children }: PropsWithChildren) {
  useEffect(subscribeAppFocus, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
