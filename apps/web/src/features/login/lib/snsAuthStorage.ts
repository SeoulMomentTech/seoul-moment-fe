const PROVIDER_KEY = "sns:provider";
const SIGNUP_TOKEN_KEY = "sns:signupToken";
const SIGNUP_EMAIL_KEY = "sns:signupEmail";
const EMAIL_TOKEN_KEY = "sns:emailToken";
const LINE_PENDING_KEY = "sns:linePending";

export type SnsProvider = "google" | "line";

/** 이메일 확보가 끝나 닉네임·약관만 받으면 가입할 수 있는 상태 */
interface SnsSignupReady {
  status: "ready";
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
  status: "emailPending";
  provider: SnsProvider;
  /** 인증 코드 발송·검증 API 에 전달하는 단기 토큰 (10분) */
  emailToken: string;
}

export type SnsSignupContext = SnsSignupReady | SnsSignupEmailPending;

/**
 * 가입 진행 가능 상태인지(= signupToken 을 이미 받았는지) 좁힌다.
 *
 * status 리터럴로 판정하므로 두 토큰을 동시에 가진 값은 타입 단계에서 막힌다.
 * 키의 유무로 좁히면 `{ signupToken, emailToken }` 도 ready 로 통과했다.
 */
export const isSnsSignupReady = (
  context: SnsSignupContext,
): context is SnsSignupReady => context.status === "ready";

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
    return {
      status: "ready",
      provider,
      signupToken,
      email: email ?? undefined,
    };
  }

  const emailToken = sessionStorage.getItem(EMAIL_TOKEN_KEY);
  if (emailToken) return { status: "emailPending", provider, emailToken };

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
 * 소비하지 않고 확인만 했을 때, 방치된 시도가 나중 방문에서 갑자기 로그인으로
 * 이어지지 않도록 두는 상한. 동의 화면 체류 + LIFF 2회 로드를 덮을 만큼 넉넉하다.
 */
const LINE_PENDING_TTL_MS = 5 * 60 * 1000;

/**
 * LINE 인증 화면으로 나가기 직전에 표시한다. LIFF 로그인은 리다이렉트라서
 * 복귀 시점에 "우리가 시작한 로그인인지"를 이 플래그로만 판단한다.
 * 플래그 없이 LIFF 세션 유무로 판단하면, 이메일 로그인을 하려고 들어온
 * 사용자까지 LINE 플로우로 끌려간다.
 */
export const markLineLoginPending = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LINE_PENDING_KEY, String(Date.now()));
};

/**
 * 플래그를 **소비하지 않고** 확인한다.
 *
 * 복귀 처리는 두 번 중단될 수 있다. StrictMode 는 effect 를 mount → cleanup →
 * mount 로 이중 실행하고, LIFF 는 primary redirect URL 에서 인증 코드를 교환한
 * 뒤 secondary URL 로 다시 이동시킨다. 시작 시점에 플래그를 지우면 정작
 * 토큰을 쓸 수 있는 쪽에는 플래그가 남지 않아 로그인이 완료되지 않는다.
 * 그래서 제거는 종료 시점(clearLineLoginPending)에만 한다.
 */
export const readLineLoginPending = (): boolean => {
  if (typeof window === "undefined") return false;

  const raw = window.sessionStorage.getItem(LINE_PENDING_KEY);
  if (!raw) return false;

  const startedAt = Number(raw);
  if (
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt > LINE_PENDING_TTL_MS
  ) {
    window.sessionStorage.removeItem(LINE_PENDING_KEY);
    return false;
  }

  return true;
};

/** 복귀 처리가 끝났을 때(로그인 발사 · 취소 확정 · 오류)만 호출한다. */
export const clearLineLoginPending = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(LINE_PENDING_KEY);
};
