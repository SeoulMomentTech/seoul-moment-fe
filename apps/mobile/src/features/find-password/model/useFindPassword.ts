import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { PasswordVerifyRes } from "@shared/services/auth";
import {
  patchPassword,
  postPasswordEmailCode,
  postPasswordEmailVerify,
  postPasswordPhoneCode,
  postPasswordPhoneVerify,
} from "@shared/services/auth";

import type { CommonRes } from "@shared/services";

/** 이메일로 코드 보내기. 404 는 그 주소로 가입한 사람이 없다는 뜻이다. */
export const useSendPasswordEmailCode = () =>
  useAppMutation<unknown, HTTPError, string>({
    mutationFn: postPasswordEmailCode,
  });

/** 휴대폰으로 코드 보내기. 404 는 그 번호로 가입한 사람이 없다는 뜻이다. */
export const useSendPasswordPhoneCode = () =>
  useAppMutation<unknown, HTTPError, string>({
    mutationFn: postPasswordPhoneCode,
  });

/** 이메일 코드 검증. 통과하면 비밀번호를 바꿀 일회용 토큰이 온다. */
export const useVerifyPasswordEmailCode = () =>
  useAppMutation<
    CommonRes<PasswordVerifyRes>,
    HTTPError,
    { email: string; code: string }
  >({ mutationFn: postPasswordEmailVerify });

/** 휴대폰 코드 검증. 응답 모양은 이메일 쪽과 같다. */
export const useVerifyPasswordPhoneCode = () =>
  useAppMutation<
    CommonRes<PasswordVerifyRes>,
    HTTPError,
    { phone: string; code: string }
  >({ mutationFn: postPasswordPhoneVerify });

/** 새 비밀번호 저장. 401 은 일회용 토큰이 만료됐다는 뜻이라 처음부터 다시 받아야 한다. */
export const useResetPassword = () =>
  useAppMutation<unknown, HTTPError, { password: string; token: string }>({
    mutationFn: patchPassword,
  });
