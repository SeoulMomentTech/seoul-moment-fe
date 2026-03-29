import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

export interface UseAppQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  toastOnError?: boolean | string;
}

export function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: UseAppQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    meta: {
      ...options.meta,
      toastOnError: options.toastOnError,
    },
  });
}
