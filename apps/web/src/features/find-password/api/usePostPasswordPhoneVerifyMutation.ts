import type { HTTPError } from "ky";

import {
  type PasswordEmailVerifyResponse,
  postPasswordPhoneVerify,
  type VerifyPhoneCodePayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UsePostPasswordPhoneVerifyMutationOptions {
  onSuccess?(token: string): void;
  onError?(error: HTTPError): void;
}

export function usePostPasswordPhoneVerifyMutation({
  onSuccess,
  onError,
}: UsePostPasswordPhoneVerifyMutationOptions = {}) {
  return useAppMutation<
    CommonRes<PasswordEmailVerifyResponse>,
    HTTPError,
    VerifyPhoneCodePayload
  >({
    mutationFn: postPasswordPhoneVerify,
    onSuccess: (res) => {
      onSuccess?.(res.data.token);
    },
    onError,
  });
}
