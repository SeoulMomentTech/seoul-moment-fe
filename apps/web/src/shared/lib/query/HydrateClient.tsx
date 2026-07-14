import type { PropsWithChildren } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "./queryClient";

/**
 * 서버에서 prefetch한 데이터를 클라이언트로 하이드레이션하는 재사용 래퍼.
 *
 * 같은 요청 안에서 `getQueryClient()`가 동일한 요청별 인스턴스를 반환하므로,
 * page(서버 컴포넌트)에서 아래처럼 prefetch한 뒤 이 컴포넌트로 감싸면
 * 별도 state 전달 없이 dehydrate 결과가 하위 클라이언트 컴포넌트로 전달된다.
 *
 * @example
 * const queryClient = getQueryClient();
 * await queryClient.prefetchQuery({ queryKey, queryFn });
 * return (
 *   <HydrateClient>
 *     <ProductDetailPage />
 *   </HydrateClient>
 * );
 */
export function HydrateClient({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
