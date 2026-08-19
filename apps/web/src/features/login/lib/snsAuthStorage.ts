const PROVIDER_KEY = "sns:provider";
const SIGNUP_TOKEN_KEY = "sns:signupToken";
const SIGNUP_EMAIL_KEY = "sns:signupEmail";
const LINE_PENDING_KEY = "sns:linePending";

export type SnsProvider = "google" | "line";

export interface SnsSignupContext {
  provider: SnsProvider;
  signupToken: string;
  /**
   * LINE 은 email scope 미승인 · 사용자 미동의 · 계정에 이메일 미등록 중
   * 어느 경우든 이메일을 주지 않을 수 있다. Google 은 항상 내려온다.
   */
  email?: string;
}

const isSnsProvider = (value: string | null): value is SnsProvider =>
  value === "google" || value === "line";

export const saveSnsSignupContext = ({
  provider,
  signupToken,
  email,
}: SnsSignupContext) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROVIDER_KEY, provider);
  window.sessionStorage.setItem(SIGNUP_TOKEN_KEY, signupToken);
  if (email) {
    window.sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
  } else {
    window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
  }
};

export const readSnsSignupContext = (): SnsSignupContext | null => {
  if (typeof window === "undefined") return null;

  const signupToken = window.sessionStorage.getItem(SIGNUP_TOKEN_KEY);
  if (!signupToken) return null;

  const storedProvider = window.sessionStorage.getItem(PROVIDER_KEY);
  // provider 키가 없는 세션은 LINE 도입 전에 시작된 Google 가입이다.
  // 배포 시점에 가입 중이던 사용자를 튕기지 않기 위해 google 로 폴백한다.
  const provider = isSnsProvider(storedProvider) ? storedProvider : "google";

  const email = window.sessionStorage.getItem(SIGNUP_EMAIL_KEY);

  return { provider, signupToken, email: email ?? undefined };
};

export const clearSnsSignupContext = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROVIDER_KEY);
  window.sessionStorage.removeItem(SIGNUP_TOKEN_KEY);
  window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
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
