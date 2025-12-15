import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

export default function useAppInfiniteQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseInfiniteQueryResult<TData, TError> {
  return useInfiniteQuery(options);
}
