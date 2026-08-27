import type { HTTPError } from "ky";

import {
  postLineEmailCode,
  type PostLineEmailCodePayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UseLineEmailCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

/**
 * LINE 1-B단계 — LINE이 이메일을 주지 않은 경우 직접 입력한 이메일로 인증 코드를 발송한다.
 * 회원가입용 코드 발송과 달리 이미 가입된 이메일이어도 409가 아니다 (기존 계정 연결이 정상 경로).
 */
export function useLineEmailCodeMutation({
  onSuccess,
  onError,
}: UseLineEmailCodeMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, PostLineEmailCodePayload>({
    mutationFn: postLineEmailCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
