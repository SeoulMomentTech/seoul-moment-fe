import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postLineSignup,
  type PostLineSignupPayload,
  type UserLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseLineSignupMutationOptions {
  onSuccess?(data: UserLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useLineSignupMutation({
  onSuccess,
  onError,
}: UseLineSignupMutationOptions = {}) {
  const login = useUserAuthStore((s) => s.login);

  return useAppMutation<
    CommonRes<UserLoginResponse>,
    HTTPError,
    PostLineSignupPayload
  >({
    mutationFn: postLineSignup,
    toastOnError: true,
    onSuccess: (res) => {
      const { token, refreshToken } = res.data;
      login({ accessToken: token, refreshToken });
      onSuccess?.(res.data);
    },
    onError,
  });
}
