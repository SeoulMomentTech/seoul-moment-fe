import { cache } from "react";

import { isKyError } from "ky";
import { toast } from "sonner";

import * as Sentry from "@sentry/nextjs";
import type { ExtendedHTTPError } from "@shared/services";
import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

/**
 * 매 호출마다 새로운 QueryClient를 생성하는 팩토리.
 *
 * QueryCache/MutationCache(Sentry·toast) 로직과 기본 옵션을 한곳에 모아
 * 서버(요청별 인스턴스)와 브라우저(싱글톤)가 동일한 설정을 공유하게 한다.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5분
      },
      dehydrate: {
        // 서버에서 prefetch 중인(pending) 쿼리도 직렬화해 스트리밍 하이드레이션을 지원한다.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        // Next.js가 동적 페이지를 감지하는 서버 에러를 삼키지 않도록 redact를 끈다.
        shouldRedactErrors: () => false,
      },
    },
    queryCache: new QueryCache({
      onError: (err, query) => {
        if (query.meta?.logError && !(err as ExtendedHTTPError).isReported) {
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
          if (isKyError(err)) {
            const kyError = err as ExtendedHTTPError;
            kyError.response
              .clone()
              .json()
              .then((data) => {
                const message = (data as { message?: string } | null)?.message;
                toast.error(message ?? err.message);
              })
              .catch(() => {
                toast.error(err.message);
              });
          } else {
            toast.error(err.message);
          }
        }
      },
    }),
  });
}

// 서버에서는 React cache()로 요청 스코프 싱글톤을 만든다. 같은 요청 안에서
// prefetch(page)와 dehydrate(HydrateClient)가 동일 인스턴스를 공유하고,
// cache()가 요청 단위로 격리되므로 요청 간 캐시 오염도 없다.
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * 실행 환경에 맞는 QueryClient를 반환한다.
 *
 * - 서버: 요청 스코프로 동일 인스턴스를 재사용한다(React cache).
 * - 브라우저: 최초 1회만 만들고 이후 동일 인스턴스를 재사용한다(싱글톤).
 *
 * suspense 경계 이전에서 useState로 초기화하면 초기 렌더 suspend 시
 * React가 클라이언트를 폐기할 수 있어, 브라우저에서는 모듈 스코프 싱글톤을 쓴다.
 */
export function getQueryClient() {
  if (isServer) {
    return getServerQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
