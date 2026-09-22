/** `resolveRedirectPath` 가 검증에 실패했을 때 떨어지는 곳. */
export const DEFAULT_REDIRECT_PATH = "/";

/**
 * 로그인 뒤 돌아갈 경로를 검증한다.
 *
 * `?redirect=` 는 URL 을 통해 들어오므로 신뢰 경계 밖이다. 검증 없이 그대로
 * `router.replace` 에 넘기면 `https://evil.example` 같은 값이 방금 인증된 사용자를
 * 외부로 튕겨내는 오픈 리다이렉트가 된다. 내부 절대 경로(`/`로 시작하고, `//`로
 * 시작하지 않으며 — 프로토콜 상대 URL 취급을 막는다 —, `:` 를 포함하지 않는 값 —
 * `javascript:`·`https:` 스킴을 막는다)만 통과시키고, 그 밖은 모두 기본값으로
 * 떨어뜨린다.
 */
export const resolveRedirectPath = (
  redirect: string | null | undefined,
): string => {
  if (!redirect) return DEFAULT_REDIRECT_PATH;
  if (!redirect.startsWith("/")) return DEFAULT_REDIRECT_PATH;
  if (redirect.startsWith("//")) return DEFAULT_REDIRECT_PATH;
  if (redirect.includes(":")) return DEFAULT_REDIRECT_PATH;

  return redirect;
};
