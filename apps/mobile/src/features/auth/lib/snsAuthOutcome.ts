import type { PostSnsLoginRes } from "@shared/services/auth";

/**
 * SNS login 응답과 이메일 verify 응답이 뜻하는 결과. 두 API 는 모양도 분기도 같아서
 * "이 응답이 어느 결과인가" 하는 판정을 한 곳에 모으고, 결과별 실행(로그인·연결·이동)은
 * 호출부에 남긴다. 웹 classifySnsAuthResponse 와 같은 규칙이다.
 */
export type SnsAuthOutcome =
  /** 이미 연결된 계정이라 서버가 바로 로그인시켰다. */
  | { kind: "loggedIn"; accessToken: string; refreshToken: string }
  /** provider 가 이메일을 주지 않았다. 직접 입력받아 인증해야 한다. */
  | { kind: "needsEmail"; emailToken: string }
  /** 그 이메일로 이미 가입된 계정이 있다. 연결할지 물어야 한다. */
  | { kind: "needsLink"; email: string; linkToken: string }
  /** 신규 가입. 닉네임과 약관만 받으면 된다. */
  | {
      kind: "readyToSignup";
      signupToken: string;
      email?: string;
      name?: string;
    }
  /** 로그인도 연결도 가입도 아닌 응답. 나아갈 단계가 없다. */
  | { kind: "unusable" };

/**
 * 판정만 하고 아무것도 실행하지 않는다.
 *
 * 나아갈 수 있는 단계를 정하는 것은 **토큰의 유무**이므로 needsSignup 같은 보조
 * 플래그가 아니라 토큰으로 가른다. 순서도 뜻이 있다 — 이미 로그인된 쪽이 가장 앞이고,
 * 이메일을 확보하는 일이 연결·가입 판단보다 앞선다.
 */
export const classifySnsAuthResponse = (
  data: PostSnsLoginRes,
  /** 응답에 email 이 없을 때 대신 쓸 주소. 방금 이메일 인증을 통과한 경우에만 넘긴다. */
  fallbackEmail?: string,
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

  // 어느 계정에 연결하는지 보여 주지 못하면 확인을 받을 수 없다.
  if (data.needsLinkConfirm && data.linkToken && email) {
    return { kind: "needsLink", email, linkToken: data.linkToken };
  }

  if (data.signupToken) {
    return {
      kind: "readyToSignup",
      signupToken: data.signupToken,
      email,
      name: data.name,
    };
  }

  return { kind: "unusable" };
};
