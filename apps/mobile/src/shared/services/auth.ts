import type { CommonRes } from ".";
import { api } from ".";

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

export interface UserSignUpPayload {
  email: string;
  password: string;
  nickname: string;
  /** 신상품 및 기획전 출시 알림 */
  newProductAgreed?: boolean;
  /** 광고 및 이벤트 할인 이메일 */
  adAgreed?: boolean;
  /** 개인 맞춤 상품 추천 알림 */
  recommendAgreed?: boolean;
}

/**
 * @description 회원 가입용 이메일 인증 코드 발송 (응답 없음 / 409: 이미 가입된 이메일)
 */
export const postUserEmailCode = (email: string) =>
  api.post("user/auth/email/code", { json: { email } });

/**
 * @description 이메일 인증번호 검증
 */
export const verifyEmailCode = (data: { email: string; code: string }) =>
  api.post("auth/email/verify", { json: data }).json<{ success: boolean }>();

/**
 * @description 닉네임 중복 검사 (응답 없음 / 409: 이미 존재하는 닉네임)
 */
export const postNicknameValidate = (nickname: string) =>
  api.post("user/auth/nickname/validate", { json: { nickname } });

/**
 * @description 유저 회원가입 (응답: 204 No Content)
 */
export const postUserSignUp = (data: UserSignUpPayload) =>
  api.post("user/auth/signup", { json: data });
