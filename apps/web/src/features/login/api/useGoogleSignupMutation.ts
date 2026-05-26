import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postGoogleSignup,
  type PostGoogleSignupPayload,
  type UserLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseGoogleSignupMutationOptions {
  onSuccess?(data: UserLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useGoogleSignupMutation({
  onSuccess,
  onError,
}: UseGoogleSignupMutationOptions = {}) {
  const login = useUserAuthStore((s) => s.login);

  return useAppMutation<
    CommonRes<UserLoginResponse>,
    HTTPError,
    PostGoogleSignupPayload
  >({
    mutationFn: postGoogleSignup,
    toastOnError: true,
    onSuccess: (res) => {
      const { token, refreshToken } = res.data;
      login({ accessToken: token, refreshToken });
      onSuccess?.(res.data);
    },
    onError,
  });
}
