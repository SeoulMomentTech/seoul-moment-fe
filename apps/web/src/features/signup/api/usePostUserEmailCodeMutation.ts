import type { HTTPError } from "ky";

import { postUserEmailCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostUserEmailCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostUserEmailCodeMutation({
  onSuccess,
  onError,
}: UsePostUserEmailCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, string>({
    mutationFn: postUserEmailCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
