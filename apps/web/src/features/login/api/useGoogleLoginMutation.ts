import type { HTTPError } from "ky";

import {
  postGoogleLogin,
  type PostGoogleLoginPayload,
  type PostGoogleLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseGoogleLoginMutationOptions {
  onSuccess?(data: PostGoogleLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useGoogleLoginMutation({
  onSuccess,
  onError,
}: UseGoogleLoginMutationOptions = {}) {
  return useAppMutation<
    CommonRes<PostGoogleLoginResponse>,
    HTTPError,
    PostGoogleLoginPayload
  >({
    mutationFn: postGoogleLogin,
    onSuccess: (res) => {
      onSuccess?.(res.data);
    },
    onError,
  });
}
