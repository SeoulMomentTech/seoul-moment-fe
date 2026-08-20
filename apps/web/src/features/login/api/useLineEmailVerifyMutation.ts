import type { HTTPError } from "ky";

import {
  postLineEmailVerify,
  type PostLineEmailVerifyPayload,
  type PostLineLoginResponse,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

interface UseLineEmailVerifyMutationOptions {
  onSuccess?(data: PostLineLoginResponse): void;
  onError?(error: HTTPError): void;
}

/**
 * LINE 1-B단계 — 입력한 이메일의 인증 코드를 검증한다.
 * 응답은 line/login 과 같은 shape이라, 검증 성공 후 needsLinkConfirm(2-A) / needsSignup(2-B) 으로 다시 분기해야 한다.
 */
export function useLineEmailVerifyMutation({
  onSuccess,
  onError,
}: UseLineEmailVerifyMutationOptions = {}) {
  return useAppMutation<
    CommonRes<PostLineLoginResponse>,
    HTTPError,
    PostLineEmailVerifyPayload
  >({
    mutationFn: postLineEmailVerify,
    onSuccess: (res) => {
      onSuccess?.(res.data);
    },
    onError,
  });
}
