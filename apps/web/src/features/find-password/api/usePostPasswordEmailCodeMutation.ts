import type { HTTPError } from "ky";

import { postPasswordEmailCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostPasswordEmailCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostPasswordEmailCodeMutation({
  onSuccess,
  onError,
}: UsePostPasswordEmailCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, string>({
    mutationFn: postPasswordEmailCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
