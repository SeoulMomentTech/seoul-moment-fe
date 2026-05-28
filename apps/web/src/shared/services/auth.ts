import type { CommonRes } from ".";
import { api } from ".";

export interface UserSignUpPayload {
  email: string;
  password: string;
  /** 닉네임 */
  nickname: string;
  /** 신상품 및 기획전 출시 알림 */
  newProductAgreed?: boolean;
  /** 광고 및 이벤트 할인 이메일 */
  adAgreed?: boolean;
  /** 개인 맞춤 상품 추천 알림 */
  recommendAgreed?: boolean;
}

export interface VerifyEmailCodePayload {
  email: string;
  code: string;
}

export interface PostNicknameValidatePayload {
  /** 닉네임 */
  nickname: string;
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

export interface PostGoogleLoginPayload {
  /** Google Sign-In에서 발급받은 idToken */
  idToken: string;
}

export interface PostGoogleLoginResponse {
  /** Google 계정 연결 확인이 필요한지 여부. true면 email/linkToken이 내려가고, 연결 확인 모달 후 /user/auth/google/link 호출 필요 */
  needsLinkConfirm: boolean;
  /** 연결 확인 또는 신규 가입이 필요한 경우 표시용 Google 계정 이메일 */
  email?: string;
  /** 연결 확인이 필요한 경우 /user/auth/google/link에 전달할 단기 JWT (5분 만료) */
  linkToken?: string;
  /** 가입된 이메일이 없어 SNS 회원가입이 필요한지 여부 */
  needsSignup?: boolean;
  /** SNS 회원가입이 필요한 경우 /user/auth/google/signup에 전달할 단기 JWT (10분 만료) */
  signupToken?: string;
  /** 이미 연결된 계정인 경우 발급되는 access token */
  token?: string;
  /** 이미 연결된 계정인 경우 발급되는 refresh token */
  refreshToken?: string;
}

export interface PostGoogleLinkPayload {
  /** /user/auth/google/login 응답으로 받은 단기 linkToken */
  linkToken: string;
}

export interface PostGoogleSignupPayload {
  /** /user/auth/google/login 응답으로 받은 단기 signupToken */
  signupToken: string;
  /** 닉네임 */
  nickname: string;
  /** 신상품 및 기획전 출시 알림 */
  newProductAgreed?: boolean;
  /** 광고 및 이벤트 할인 이메일 */
  adAgreed?: boolean;
  /** 개인 맞춤 상품 추천 알림 */
  recommendAgreed?: boolean;
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
 * @description 회원 가입용 이메일 인증 코드 발송 (응답 없음 / 409: 이미 가입된 이메일)
 */
export const postUserEmailCode = (email: string) =>
  api.post("user/auth/email/code", {
    json: { email },
  });

/**
 * @description 닉네임 중복 검사 (응답 없음 / 409: 이미 존재하는 닉네임)
 */
export const postNicknameValidate = (data: PostNicknameValidatePayload) =>
  api.post("user/auth/nickname/validate", {
    json: data,
  });

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

/**
 * @description Google 로그인 / 연결확인 / 신규가입 분기 (1단계). idToken 검증 후 토큰 또는 linkToken/signupToken 발급
 */
export const postGoogleLogin = (data: PostGoogleLoginPayload) =>
  api
    .post("user/auth/google/login", {
      json: data,
    })
    .json<CommonRes<PostGoogleLoginResponse>>();

/**
 * @description Google 계정 연결 (2-A단계). 기존 계정에 Google 계정을 연결하고 access/refresh 토큰 발급
 */
export const postGoogleLink = (data: PostGoogleLinkPayload) =>
  api
    .post("user/auth/google/link", {
      json: data,
    })
    .json<CommonRes<UserLoginResponse>>();

/**
 * @description Google SNS 회원가입 (2-B단계). signupToken + 닉네임/약관동의로 신규 가입 후 access/refresh 토큰 발급
 */
export const postGoogleSignup = (data: PostGoogleSignupPayload) =>
  api
    .post("user/auth/google/signup", {
      json: data,
    })
    .json<CommonRes<UserLoginResponse>>();
