import type { HTTPError } from "ky";

import {
  postLineLogin,
  type PostLineLoginPayload,
  type PostLineLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseLineLoginMutationOptions {
  onSuccess?(data: PostLineLoginResponse): void;
  onError?(error: HTTPError): void;
}

export function useLineLoginMutation({
  onSuccess,
  onError,
}: UseLineLoginMutationOptions = {}) {
  return useAppMutation<
    CommonRes<PostLineLoginResponse>,
    HTTPError,
    PostLineLoginPayload
  >({
    mutationFn: postLineLogin,
    onSuccess: (res) => {
      onSuccess?.(res.data);
    },
    onError,
  });
}
