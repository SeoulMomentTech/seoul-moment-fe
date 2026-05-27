import type { HTTPError } from "ky";

import { postUserPhoneCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostUserPhoneCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostUserPhoneCodeMutation({
  onSuccess,
  onError,
}: UsePostUserPhoneCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, string>({
    mutationFn: postUserPhoneCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
