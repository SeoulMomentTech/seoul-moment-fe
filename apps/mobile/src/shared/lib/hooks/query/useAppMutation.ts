import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

interface UseAppMutationProps<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  logOnError?: boolean;
}

export default function useAppMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  logOnError = false,
  ...options
}: UseAppMutationProps<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> {
  return useMutation({
    ...options,
    meta: { logError: logOnError },
  });
}
