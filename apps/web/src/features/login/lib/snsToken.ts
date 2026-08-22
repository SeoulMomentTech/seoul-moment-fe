import { decodeJWT } from "@shared/lib/utils";

/**
 * 만료를 이만큼 앞당겨 판단한다. 서버 왕복 중에 만료되어 확정적으로
 * 거절당하는 토큰을 미리 걸러낸다.
 */
const EXPIRY_SKEW_SEC = 5;

/**
 * SNS 플로우의 단기 토큰(emailToken 10분 / linkToken 5분 / signupToken 10분)이
 * 만료됐는지 확인한다.
 *
 * 서버는 "토큰 만료"와 "인증 코드 불일치"에 모두 401 을 주고 본문으로 구분할
 * 수 없다. 요청 전에 exp 를 먼저 확인해 두면 401 을 코드 불일치로 해석할 수 있다.
 *
 * exp 를 읽을 수 없는 토큰은 만료로 취급한다. 어차피 거절당할 요청을 보내는
 * 것보다 처음부터 다시 인증하는 편이 낫다.
 */
export const isSnsTokenExpired = (token: string) => {
  const exp = decodeJWT<{ exp?: number }>(token)?.exp;
  if (!exp) return true;
  return exp * 1000 <= Date.now() + EXPIRY_SKEW_SEC * 1000;
};
