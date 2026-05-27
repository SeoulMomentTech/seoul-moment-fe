import type { HTTPError } from "ky";

import { postInfoPhoneCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostInfoPhoneCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostInfoPhoneCodeMutation({
  onSuccess,
  onError,
}: UsePostInfoPhoneCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, string>({
    mutationFn: postInfoPhoneCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
