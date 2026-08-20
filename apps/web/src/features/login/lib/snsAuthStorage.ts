const PROVIDER_KEY = "sns:provider";
const SIGNUP_TOKEN_KEY = "sns:signupToken";
const SIGNUP_EMAIL_KEY = "sns:signupEmail";
const EMAIL_TOKEN_KEY = "sns:emailToken";
const LINE_PENDING_KEY = "sns:linePending";

export type SnsProvider = "google" | "line";

/** 이메일 확보가 끝나 닉네임·약관만 받으면 가입할 수 있는 상태 */
interface SnsSignupReady {
  provider: SnsProvider;
  signupToken: string;
  /**
   * LINE 은 email scope 미승인 · 사용자 미동의 · 계정에 이메일 미등록 중
   * 어느 경우든 이메일을 주지 않을 수 있다. Google 은 항상 내려온다.
   */
  email?: string;
}

/**
 * provider 가 이메일을 주지 않아 가입 화면에서 직접 입력받아야 하는 상태.
 * signupToken 은 이메일 인증을 통과한 뒤에야 발급된다.
 */
interface SnsSignupEmailPending {
  provider: SnsProvider;
  /** 인증 코드 발송·검증 API 에 전달하는 단기 토큰 (10분) */
  emailToken: string;
}

export type SnsSignupContext = SnsSignupReady | SnsSignupEmailPending;

/** 가입 진행 가능 상태인지(= signupToken 을 이미 받았는지) 좁힌다. */
export const isSnsSignupReady = (
  context: SnsSignupContext,
): context is SnsSignupReady => "signupToken" in context;

const isSnsProvider = (value: string | null): value is SnsProvider =>
  value === "google" || value === "line";

export const saveSnsSignupContext = (context: SnsSignupContext) => {
  if (typeof window === "undefined") return;

  const { sessionStorage } = window;
  sessionStorage.setItem(PROVIDER_KEY, context.provider);

  // 두 토큰은 배타적이다. 남겨두면 만료된 이전 단계 토큰으로 요청하게 된다.
  if (isSnsSignupReady(context)) {
    sessionStorage.setItem(SIGNUP_TOKEN_KEY, context.signupToken);
    sessionStorage.removeItem(EMAIL_TOKEN_KEY);
    if (context.email) {
      sessionStorage.setItem(SIGNUP_EMAIL_KEY, context.email);
    } else {
      sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
    }
    return;
  }

  sessionStorage.setItem(EMAIL_TOKEN_KEY, context.emailToken);
  sessionStorage.removeItem(SIGNUP_TOKEN_KEY);
  sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
};

export const readSnsSignupContext = (): SnsSignupContext | null => {
  if (typeof window === "undefined") return null;

  const { sessionStorage } = window;
  const storedProvider = sessionStorage.getItem(PROVIDER_KEY);
  // provider 키가 없는 세션은 LINE 도입 전에 시작된 Google 가입이다.
  // 배포 시점에 가입 중이던 사용자를 튕기지 않기 위해 google 로 폴백한다.
  const provider = isSnsProvider(storedProvider) ? storedProvider : "google";

  // 가입 단계가 이메일 인증 단계보다 뒤이므로 signupToken 을 우선한다.
  const signupToken = sessionStorage.getItem(SIGNUP_TOKEN_KEY);
  if (signupToken) {
    const email = sessionStorage.getItem(SIGNUP_EMAIL_KEY);
    return { provider, signupToken, email: email ?? undefined };
  }

  const emailToken = sessionStorage.getItem(EMAIL_TOKEN_KEY);
  if (emailToken) return { provider, emailToken };

  return null;
};

export const clearSnsSignupContext = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROVIDER_KEY);
  window.sessionStorage.removeItem(SIGNUP_TOKEN_KEY);
  window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
  window.sessionStorage.removeItem(EMAIL_TOKEN_KEY);
};

/**
 * LINE 인증 화면으로 나가기 직전에 표시한다. LIFF 로그인은 리다이렉트라서
 * 복귀 시점에 "우리가 시작한 로그인인지"를 이 플래그로만 판단한다.
 * 플래그 없이 LIFF 세션 유무로 판단하면, 이메일 로그인을 하려고 들어온
 * 사용자까지 LINE 플로우로 끌려간다.
 */
export const markLineLoginPending = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LINE_PENDING_KEY, "1");
};

/**
 * 플래그를 읽고 즉시 제거한다. StrictMode 의 effect 이중 실행에서도
 * 한 번만 true 가 된다.
 */
export const consumeLineLoginPending = (): boolean => {
  if (typeof window === "undefined") return false;

  const pending = window.sessionStorage.getItem(LINE_PENDING_KEY);
  if (!pending) return false;

  window.sessionStorage.removeItem(LINE_PENDING_KEY);
  return true;
};
