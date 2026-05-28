import type { HTTPError } from "ky";

import {
  verifyPhoneCode,
  type VerifyPhoneCodePayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UseVerifyPhoneCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function useVerifyPhoneCodeMutation({
  onSuccess,
  onError,
}: UseVerifyPhoneCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, VerifyPhoneCodePayload>({
    mutationFn: verifyPhoneCode,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
