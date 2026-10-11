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

/**
 * SNS(LINE) 로그인 응답. 한 응답이 네 갈래를 모두 담는다 — 어느 갈래인지는
 * 플래그가 아니라 **어떤 토큰이 왔는지**로 가린다(classifySnsAuthResponse).
 *
 * 이메일 인증(line/email/verify)도 같은 모양으로 돌아오므로 판정이 한 벌이면 된다.
 */
export interface PostSnsLoginRes {
  /** 이미 연결된 계정이면 이 둘이 온다. */
  token?: string;
  refreshToken?: string;
  /** provider 가 이메일을 주지 않았을 때(사용자가 동의 화면에서 거부). */
  needsEmail?: boolean;
  emailToken?: string;
  /** 그 이메일로 이미 가입된 계정이 있을 때. */
  needsLinkConfirm: boolean;
  linkToken?: string;
  /** 가입된 이메일이 없을 때. */
  needsSignup?: boolean;
  signupToken?: string;
  /** 연결·가입 화면에 보여 줄 SNS 이메일. */
  email?: string;
  /** 닉네임 칸의 기본값으로 쓰라고 주는 SNS 표시 이름. 그대로 저장되지는 않는다. */
  name?: string;
}

/**
 * @description LINE 로그인 / 연결확인 / 신규가입 분기 (1단계).
 * 401: 유효하지 않은 idToken / 409: 그 계정에 이미 다른 SNS 가 연결됨(계정당 하나)
 */
export const postLineLogin = (idToken: string) =>
  api
    .post("user/auth/line/login", { json: { idToken } })
    .json<CommonRes<PostSnsLoginRes>>();

/**
 * @description LINE 계정 연결 (2-A단계). 기존 계정에 SNS 를 붙이고 로그인시킨다.
 * 401: linkToken 만료·변조 / 409: 이미 연결된 LINE 계정
 */
export const postLineLink = (linkToken: string) =>
  api
    .post("user/auth/line/link", { json: { linkToken } })
    .json<CommonRes<UserLoginResponse>>();

export interface PostSnsSignUpReq {
  signupToken: string;
  nickname: string;
  newProductAgreed?: boolean;
  adAgreed?: boolean;
  recommendAgreed?: boolean;
}

/**
 * @description LINE SNS 회원가입 (2-B단계). 이메일 가입과 달리 토큰을 바로 준다.
 * 401: signupToken 만료·변조 / 409: 이미 쓰는 닉네임 또는 이미 가입된 이메일
 */
export const postLineSignUp = (data: PostSnsSignUpReq) =>
  api
    .post("user/auth/line/signup", { json: data })
    .json<CommonRes<UserLoginResponse>>();

export interface LineEmailCodeReq {
  emailToken: string;
  email: string;
}

/**
 * @description LINE 이 이메일을 주지 않았을 때 직접 받은 주소로 코드 발송 (1-B단계).
 * 401: emailToken 만료·변조
 */
export const postLineEmailCode = (data: LineEmailCodeReq) =>
  api.post("user/auth/line/email/code", { json: data });

/**
 * @description 그 코드 검증 (1-B단계). 통과하면 login 과 **같은 모양**이 돌아오므로
 * 호출부가 같은 판정을 다시 돌린다 — 이미 연결된 계정이면 바로 로그인되기도 한다.
 * 401: emailToken 만료·변조 또는 코드 만료·불일치
 */
export const postLineEmailVerify = (
  data: LineEmailCodeReq & { code: string },
) =>
  api
    .post("user/auth/line/email/verify", { json: data })
    .json<CommonRes<PostSnsLoginRes>>();
