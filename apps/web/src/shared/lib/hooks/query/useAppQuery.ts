import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

interface UseAppQueryProps<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  logOnError?: boolean;
  /**
   * 이 쿼리의 캐시를 localStorage 에 남길지. 새로고침 직후 빈 화면이 깜박이면 곤란한
   * 쿼리에만 켠다 — 저장 여부 판단은 `shouldPersistQuery` 가 이 표식만 보고 한다.
   */
  persist?: boolean;
}

export default function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>({
  logOnError = false,
  persist = false,
  ...options
}: UseAppQueryProps<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<
  TData,
  TError
> {
  return useQuery({
    ...options,
    meta: { logError: logOnError, persist },
  });
}
