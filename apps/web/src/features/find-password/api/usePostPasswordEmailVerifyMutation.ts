import type { HTTPError } from "ky";

import {
  type PasswordEmailVerifyResponse,
  postPasswordEmailVerify,
  type VerifyEmailCodePayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UsePostPasswordEmailVerifyMutationOptions {
  onSuccess?(token: string): void;
  onError?(error: HTTPError): void;
}

export function usePostPasswordEmailVerifyMutation({
  onSuccess,
  onError,
}: UsePostPasswordEmailVerifyMutationOptions = {}) {
  return useAppMutation<
    CommonRes<PasswordEmailVerifyResponse>,
    HTTPError,
    VerifyEmailCodePayload
  >({
    mutationFn: postPasswordEmailVerify,
    onSuccess: (res) => {
      onSuccess?.(res.data.token);
    },
    onError,
  });
}
