import type { HTTPError } from "ky";

import { postPasswordPhoneCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostPasswordPhoneCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostPasswordPhoneCodeMutation({
  onSuccess,
  onError,
}: UsePostPasswordPhoneCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, string>({
    mutationFn: postPasswordPhoneCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
