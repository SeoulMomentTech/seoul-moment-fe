import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type {
  UserLoginPayload,
  UserLoginResponse,
} from "@shared/services/auth";
import { postUserLogin } from "@shared/services/auth";

import type { CommonRes } from "@shared/services";

/**
 * 이메일·비밀번호 로그인. 성공하면 토큰을 스토어에 넣고, 스토어가 SecureStore 에 저장한다.
 * web useUserLoginMutation 과 같은 처리다 — 응답의 token 이 accessToken 이다.
 */
export const useLoginMutation = ({
  onSuccess,
}: { onSuccess?(): void } = {}) => {
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
      onSuccess?.();
    },
  });
};
