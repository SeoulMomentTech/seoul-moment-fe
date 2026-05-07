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

export interface VerifyEmailCodePayload {
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

export interface PasswordEmailVerifyResponse {
  /** 비밀번호 변경 시 Authorization 헤더로 사용하는 one time token */
  token: string;
}

export interface PatchPasswordPayload {
  password: string;
  /** 비밀번호 찾기 검증으로 발급된 one time token */
  token: string;
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

/**
 * @description 비밀번호 찾기 이메일 인증 코드 발송
 */
export const postPasswordEmailCode = (email: string) =>
  api.post("user/auth/password/email/code", {
    json: { email },
  });

/**
 * @description 비밀번호 찾기 이메일 인증 코드 검증 (one time token 반환)
 */
export const postPasswordEmailVerify = (data: VerifyEmailCodePayload) =>
  api
    .post("user/auth/password/email/verify", {
      json: data,
    })
    .json<CommonRes<PasswordEmailVerifyResponse>>();

/**
 * @description 비밀번호 변경 (검증 단계에서 발급된 one time token 필요)
 */
export const patchPassword = ({ password, token }: PatchPasswordPayload) =>
  api.patch("user/auth/password", {
    json: { password },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
