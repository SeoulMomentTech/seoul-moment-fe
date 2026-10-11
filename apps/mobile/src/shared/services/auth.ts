import type { CommonRes } from ".";
import { api, SKIP_AUTH_RETRY_HEADER } from ".";

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

export interface VerifyPhoneCodePayload {
  /** 국가 코드를 포함한 전화번호. 대만은 `+886` 으로 시작한다. */
  phone: string;
  /** 6자리 인증 코드 */
  code: string;
}

/**
 * @description 회원 정보 수정용 휴대폰 인증 코드 발송
 * (access_token 필요 / 응답 없음 / 409: 이미 가입된 휴대폰)
 */
export const postInfoPhoneCode = (phone: string) =>
  api.post("user/auth/info/phone/code", { json: { phone } });

/**
 * @description 회원 정보 수정용 휴대폰 인증 코드 검증. 통과하면 그 번호가 계정에 붙는다.
 * (access_token 필요 / 응답 없음 / 401: 코드 만료 또는 불일치)
 */
export const postInfoPhoneVerify = ({ phone, code }: VerifyPhoneCodePayload) =>
  api.post("user/auth/info/phone/verify", { json: { phone, code } });

export interface PasswordVerifyRes {
  /** 비밀번호 변경 때 Authorization 으로 쓰는 일회용 토큰. */
  token: string;
}

/**
 * @description 비밀번호 찾기용 이메일 코드 발송 (응답 없음 / 404: 가입되지 않은 이메일)
 */
export const postPasswordEmailCode = (email: string) =>
  api.post("user/auth/password/email/code", { json: { email } });

/**
 * @description 비밀번호 찾기용 이메일 코드 검증 (401: 코드 만료 또는 불일치)
 *
 * 401 은 "코드가 틀렸다"는 뜻이지 "로그인이 끊겼다"가 아니다. 건너뛰기 헤더가 없으면
 * ky 의 afterResponse 가 리프레시를 돌려 멀쩡한 세션을 끊거나 요청을 다시 보낸다.
 */
export const postPasswordEmailVerify = (data: {
  email: string;
  code: string;
}) =>
  api
    .post("user/auth/password/email/verify", {
      json: data,
      headers: { [SKIP_AUTH_RETRY_HEADER]: "1" },
    })
    .json<CommonRes<PasswordVerifyRes>>();

/**
 * @description 비밀번호 찾기용 휴대폰 코드 발송 (응답 없음 / 404: 가입되지 않은 번호)
 */
export const postPasswordPhoneCode = (phone: string) =>
  api.post("user/auth/password/phone/code", { json: { phone } });

/**
 * @description 비밀번호 찾기용 휴대폰 코드 검증 (401: 코드 만료 또는 불일치)
 */
export const postPasswordPhoneVerify = (data: {
  phone: string;
  code: string;
}) =>
  api
    .post("user/auth/password/phone/verify", {
      json: data,
      headers: { [SKIP_AUTH_RETRY_HEADER]: "1" },
    })
    .json<CommonRes<PasswordVerifyRes>>();

/**
 * @description 비밀번호 변경 (검증이 준 일회용 토큰 필요 / 401: 토큰 만료·변조)
 *
 * Authorization 을 직접 세우면 attachAccessTokenHandler 가 덮어쓰지 않는다 —
 * 로그인한 채로 들어와도 액세스 토큰이 아니라 이 일회용 토큰으로 나간다.
 */
export const patchPassword = ({
  password,
  token,
}: {
  password: string;
  token: string;
}) =>
  api.patch("user/auth/password", {
    json: { password },
    headers: {
      Authorization: `Bearer ${token}`,
      [SKIP_AUTH_RETRY_HEADER]: "1",
    },
  });
