import type { HTTPError } from "ky";

import {
  postInfoPhoneVerify,
  type VerifyPhoneCodePayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostInfoPhoneVerifyMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePostInfoPhoneVerifyMutation({
  onSuccess,
  onError,
}: UsePostInfoPhoneVerifyMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, VerifyPhoneCodePayload>({
    mutationFn: postInfoPhoneVerify,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
