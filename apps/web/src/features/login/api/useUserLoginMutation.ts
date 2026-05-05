import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postUserLogin,
  type UserLoginPayload,
  type UserLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseUserLoginMutationOptions {
  onSuccess?(data: UserLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useUserLoginMutation({
  onSuccess,
  onError,
}: UseUserLoginMutationOptions = {}) {
  const login = useUserAuthStore((s) => s.login);

  return useAppMutation<
    CommonRes<UserLoginResponse>,
    HTTPError,
    UserLoginPayload
  >({
    mutationFn: postUserLogin,
    onSuccess: (res) => {
      const { token, refreshToken } = res.data;
      login({ accessToken: token, refreshToken });
      onSuccess?.(res.data);
    },
    onError,
  });
}
