import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postLineLink,
  type PostLineLinkPayload,
  type UserLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseLineLinkMutationOptions {
  onSuccess?(data: UserLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useLineLinkMutation({
  onSuccess,
  onError,
}: UseLineLinkMutationOptions = {}) {
  const login = useUserAuthStore((s) => s.login);

  return useAppMutation<
    CommonRes<UserLoginResponse>,
    HTTPError,
    PostLineLinkPayload
  >({
    mutationFn: postLineLink,
    onSuccess: (res) => {
      const { token, refreshToken } = res.data;
      login({ accessToken: token, refreshToken });
      onSuccess?.(res.data);
    },
    onError,
  });
}
