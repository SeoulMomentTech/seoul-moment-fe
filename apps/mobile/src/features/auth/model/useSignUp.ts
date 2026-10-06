import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { UserSignUpPayload } from "@shared/services/auth";
import {
  postNicknameValidate,
  postUserEmailCode,
  postUserSignUp,
  verifyEmailCode,
} from "@shared/services/auth";

/** 가입용 인증 코드 발송. 409 는 이미 가입된 이메일이라는 뜻이다. */
export const useSendEmailCode = () =>
  useAppMutation<unknown, HTTPError, string>({ mutationFn: postUserEmailCode });

/** 받은 코드 검증. success 가 false 로 올 수도 있어 호출부가 값까지 본다. */
export const useVerifyEmailCode = () =>
  useAppMutation<
    { success: boolean },
    HTTPError,
    { email: string; code: string }
  >({ mutationFn: verifyEmailCode });

/** 닉네임 중복 검사. 409 는 이미 쓰는 닉네임이라는 뜻이다. */
export const useValidateNickname = () =>
  useAppMutation<unknown, HTTPError, string>({
    mutationFn: postNicknameValidate,
  });

/** 가입. 204 라 응답 본문이 없고, 가입 후 로그인은 호출부가 따로 한다. */
export const useSignUp = () =>
  useAppMutation<unknown, HTTPError, UserSignUpPayload>({
    mutationFn: postUserSignUp,
  });
