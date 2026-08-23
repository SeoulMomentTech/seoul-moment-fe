import type { PostSnsLoginResponse } from "@shared/services/auth";

/**
 * SNS login 응답과 email verify 응답이 뜻하는 도메인 결과.
 *
 * 두 API 는 shape 도 분기도 같다. 그래서 "이 응답이 어느 결과인가" 라는 판정을
 * 한 곳에 모으고, 결과별 실행(로그인 · 다이얼로그 · 화면 이동)은 호출부에 남긴다.
 */
export type SnsAuthOutcome =
  /** 이미 연결된 계정이라 서버가 바로 로그인시켰다. */
  | { kind: "loggedIn"; accessToken: string; refreshToken: string }
  /** provider 가 이메일을 주지 않았다. 직접 입력받아 인증해야 한다. */
  | { kind: "needsEmail"; emailToken: string }
  /** 그 이메일로 이미 가입된 계정이 있다. 연결 확인을 받아야 한다. */
  | { kind: "needsLink"; email: string; linkToken: string }
  /** 신규 가입 경로. 닉네임·약관만 받으면 된다. */
  | { kind: "readyToSignup"; signupToken: string; email?: string }
  /** 로그인도 연결도 가입도 아닌 응답. 진행할 수 있는 단계가 없다. */
  | { kind: "unusable" };

interface ClassifySnsAuthOptions {
  /**
   * 응답에 email 이 없을 때 대신 쓸 이메일. 이메일 인증을 막 통과한 경우처럼
   * 호출부가 이미 이메일을 알고 있을 때만 넘긴다.
   */
  fallbackEmail?: string;
}

/**
 * 판정만 하고 아무것도 실행하지 않는 순수 함수다.
 *
 * 진행 가능한 단계를 결정하는 것은 토큰의 유무이므로 needsSignup 같은 보조
 * 플래그가 아니라 토큰을 기준으로 나눈다. 순서도 의미가 있다 — 이미 로그인된
 * 계정이 가장 앞이고, 이메일 확보가 연결·가입 판단보다 앞선다.
 */
export const classifySnsAuthResponse = (
  data: PostSnsLoginResponse,
  { fallbackEmail }: ClassifySnsAuthOptions = {},
): SnsAuthOutcome => {
  if (data.token && data.refreshToken) {
    return {
      kind: "loggedIn",
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
  }

  if (data.needsEmail && data.emailToken) {
    return { kind: "needsEmail", emailToken: data.emailToken };
  }

  const email = data.email ?? fallbackEmail;

  // 어떤 계정에 연결하는지 보여줄 수 없으면 사용자에게 확인을 받을 수 없다.
  if (data.needsLinkConfirm && data.linkToken && email) {
    return { kind: "needsLink", email, linkToken: data.linkToken };
  }

  if (data.signupToken) {
    return { kind: "readyToSignup", signupToken: data.signupToken, email };
  }

  return { kind: "unusable" };
};
