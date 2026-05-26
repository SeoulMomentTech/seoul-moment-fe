import type { HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import {
  postGoogleLink,
  type PostGoogleLinkPayload,
  type UserLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseGoogleLinkMutationOptions {
  onSuccess?(data: UserLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useGoogleLinkMutation({
  onSuccess,
  onError,
}: UseGoogleLinkMutationOptions = {}) {
  const login = useUserAuthStore((s) => s.login);

  return useAppMutation<
    CommonRes<UserLoginResponse>,
    HTTPError,
    PostGoogleLinkPayload
  >({
    mutationFn: postGoogleLink,
    onSuccess: (res) => {
      const { token, refreshToken } = res.data;
      login({ accessToken: token, refreshToken });
      onSuccess?.(res.data);
    },
    onError,
  });
}
