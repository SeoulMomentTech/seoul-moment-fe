import { AppState, Platform } from "react-native";

import type { ExtendedHTTPError } from "@shared/services";
import {
  focusManager,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

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

/**
 * RN 에는 window focus 이벤트가 없다. 앱이 foreground 로 돌아올 때를 focus 로 알려
 * refetchOnWindowFocus 가 web 의 탭 복귀처럼 동작하게 한다. web 타깃은 기본 동작을 쓴다.
 * 반환한 함수로 구독을 해제한다.
 */
export const subscribeAppFocus = () => {
  if (Platform.OS === "web") return () => {};

  const subscription = AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });

  return () => subscription.remove();
};
