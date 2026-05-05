import type { CommonRes } from ".";
import { api } from ".";

export interface UserSignUpPayload {
  email: string;
  password: string;
  phone?: string;
  /** 개인정보 수집 동의 일시. 예: "2025-01-01 12:00:00" */
  personalInfoAgreeDate: string;
  /** 광고성 이메일 수신 동의 일시 */
  adAgreeEmailDate?: string;
  /** 추천 이메일 수신 동의 일시 */
  recommendEmailDate?: string;
  /** 추천 문자 수신 동의 일시 */
  recommendPhoneDate?: string;
}

interface VerifyEmailCodePayload {
  email: string;
  code: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  refreshToken: string;
}

export interface UserOneTimeTokenResponse {
  oneTimeToken: string;
}

/**
 * @description 유저 회원가입 (응답: 204 No Content)
 */
export const postUserSignUp = (data: UserSignUpPayload) =>
  api.post("user/auth/signup", { json: data });

/**
 * @description 유저 로그인
 */
export const postUserLogin = (data: UserLoginPayload) =>
  api
    .post("user/auth/login", {
      json: data,
    })
    .json<CommonRes<UserLoginResponse>>();

/**
 * @description one time jwt token 재발급 (access_token 필요)
 */
export const getUserOneTimeToken = () =>
  api
    .get("user/auth/one-time-token")
    .json<CommonRes<UserOneTimeTokenResponse>>();

/**
 * @description 이메일 인증번호 발송
 */
export const postEmailCode = (email: string) =>
  api
    .post("auth/email/code", {
      json: { email },
    })
    .json<{ success: boolean }>();

/**
 * @description 이메일 인증번호 검증
 */
export const verifyEmailCode = ({ email, code }: VerifyEmailCodePayload) =>
  api
    .post("auth/email/verify", {
      json: { email, code },
    })
    .json<{ success: boolean }>();
