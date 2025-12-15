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
  toastOnError?: boolean;
  logOnError?: boolean;
}

export default function useAppMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  toastOnError = false,
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
    meta: { showToast: toastOnError, logError: logOnError },
  });
}
