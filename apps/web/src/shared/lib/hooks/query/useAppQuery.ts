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
}

export default function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>({
  logOnError = false,
  ...options
}: UseAppQueryProps<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<
  TData,
  TError
> {
  return useQuery({
    ...options,
    meta: { logError: logOnError },
  });
}
