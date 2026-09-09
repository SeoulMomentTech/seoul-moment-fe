"use client";

import type { PropsWithChildren } from "react";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import {
  queryPersister,
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE,
  shouldPersistQuery,
} from "./query/persister";
import { getQueryClient } from "./query/queryClient";

export function ReactQueryProvider({ children }: PropsWithChildren) {
  // 브라우저에서는 getQueryClient()가 싱글톤을 반환하므로 리렌더 간 인스턴스가 안정적이다.
  const queryClient = getQueryClient();

  // 복원이 끝날 때까지 `useIsRestoring()` 이 true 이고 그 값은 서버·클라이언트 첫 렌더가
  // 같다. 저장 상태에 따라 다르게 그려지는 화면(헤더 장바구니 배지 등)은 그 값으로
  // 보호하면 되고, hydration 불일치를 따로 막을 필요가 없다.
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: QUERY_CACHE_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
