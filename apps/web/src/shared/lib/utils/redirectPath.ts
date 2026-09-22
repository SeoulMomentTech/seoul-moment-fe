/** `resolveRedirectPath` 가 검증에 실패했을 때 떨어지는 곳. */
export const DEFAULT_REDIRECT_PATH = "/";

/** 널 문자부터 0x1F 까지의 C0 제어 문자, 그리고 DEL(0x7F). 정규식 대신 코드포인트로
 * 직접 비교한다 — `no-control-regex` 를 피하는 것 말고도, 여기서 무엇을 막는지 정규식
 * 문법 없이 바로 읽힌다. */
const isControlCharacter = (char: string) => {
  const code = char.charCodeAt(0);
  return code <= 0x1f || code === 0x7f;
};

/**
 * 로그인 뒤 돌아갈 경로를 검증한다.
 *
 * `?redirect=` 는 URL 을 통해 들어오므로 신뢰 경계 밖이다. 검증 없이 그대로
 * `router.replace` 에 넘기면 `https://evil.example` 같은 값이 방금 인증된 사용자를
 * 외부로 튕겨내는 오픈 리다이렉트가 된다. 내부 절대 경로만 통과시키고, 그 밖은 모두
 * 기본값으로 떨어뜨린다 — 이 함수 하나가 안전의 전부여야 한다. 상위 라우터의 설정
 * (예: next-intl 의 `localePrefix`)이 우연히 같은 값을 막아주는 경우가 있어도, 그건
 * 이 함수가 기대도 되는 안전장치가 아니다.
 *
 * - `/`로 시작하지 않으면 탈락 (`https://evil.example`, `javascript:alert(1)` 등)
 * - `//`로 시작하면 탈락 — 프로토콜 상대 URL(`//evil.com`)이 현재 스킴을 그대로 물려받는다
 * - `:` 를 포함하면 탈락 — `javascript:`·`https:` 같은 스킴을 막는다
 * - `\` 를 포함하면 탈락 — `new URL()` 이 `\` 를 `/` 로 정규화하므로 `/\evil.com` 이
 *   `//evil.com` 과 같은 프로토콜 상대 URL이 되어 위 `//` 검사를 그대로 우회한다
 *   (`new URL("/\\evil.com", origin).host === "evil.com"`). `//` 검사와 별개로 반드시
 *   필요하다 — 겹치는 검사처럼 보여도 지우면 안 된다.
 * - 앞뒤 공백이 있거나 제어 문자를 포함하면 탈락 — `new URL()` 이 파싱 전에 이런
 *   문자를 제거하거나 무시할 수 있어, 검증 시점과 실제 해석 시점의 문자열이 달라질 수
 *   있다
 */
export const resolveRedirectPath = (
  redirect: string | null | undefined,
): string => {
  if (!redirect) return DEFAULT_REDIRECT_PATH;
  if (redirect !== redirect.trim()) return DEFAULT_REDIRECT_PATH;
  if (!redirect.startsWith("/")) return DEFAULT_REDIRECT_PATH;
  if (redirect.startsWith("//")) return DEFAULT_REDIRECT_PATH;
  if (redirect.includes(":")) return DEFAULT_REDIRECT_PATH;
  if (redirect.includes("\\")) return DEFAULT_REDIRECT_PATH;
  if (Array.from(redirect).some(isControlCharacter))
    return DEFAULT_REDIRECT_PATH;

  return redirect;
};
