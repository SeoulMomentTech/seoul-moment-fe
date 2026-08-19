import { decodeJWT } from "@shared/lib/utils";

import type { Liff } from "@line/liff";

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID;

/**
 * id_token 만료를 이만큼 앞당겨 판단한다. 서버 왕복 중에 만료되어
 * 확정적으로 거절당하는 토큰을 미리 걸러낸다.
 */
const ID_TOKEN_EXPIRY_SKEW_SEC = 30;

export class LineSignInUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LineSignInUnavailableError";
  }
}

/**
 * LIFF ID가 주입되지 않은 환경에서는 LINE 로그인을 노출하지 않는다.
 * 호출부는 이 값으로 버튼 렌더 여부를 판단한다.
 */
export const isLineLoginConfigured = () => Boolean(LIFF_ID);

let liffPromise: Promise<Liff> | null = null;

/**
 * LIFF SDK를 동적 import 하고 init 을 1회만 수행한다.
 * 동적 import 라서 SDK 가 로그인 화면 청크에만 들어간다.
 */
const ensureLiff = async (): Promise<Liff> => {
  const liffId = LIFF_ID;
  if (!liffId) {
    throw new LineSignInUnavailableError(
      "NEXT_PUBLIC_LINE_LIFF_ID 환경 변수가 설정되지 않았습니다.",
    );
  }

  liffPromise ??= import("@line/liff")
    .then(async ({ liff }) => {
      await liff.init({ liffId });
      return liff;
    })
    .catch((error: unknown) => {
      // init 실패를 캐시하면 재시도가 영구히 막힌다.
      liffPromise = null;
      throw new LineSignInUnavailableError(
        error instanceof Error
          ? error.message
          : "LIFF SDK를 초기화하지 못했습니다.",
      );
    });

  return liffPromise;
};

/**
 * exp 를 읽을 수 없는 토큰은 만료로 취급한다.
 * 서버가 어차피 거절할 토큰을 보내는 것보다 재인증이 낫다.
 */
const isIdTokenExpired = (idToken: string) => {
  const exp = decodeJWT<{ exp?: number }>(idToken)?.exp;
  if (!exp) return true;
  return exp * 1000 <= Date.now() + ID_TOKEN_EXPIRY_SKEW_SEC * 1000;
};

/**
 * 바로 쓸 수 있는 id_token 이 있으면 반환한다.
 * LIFF 세션이 없거나 id_token 이 만료됐으면 null 이며,
 * 이때 호출부는 startLineLogin() 으로 재인증해야 한다.
 */
export const getValidLineIdToken = async (): Promise<string | null> => {
  const liff = await ensureLiff();
  if (!liff.isLoggedIn()) return null;

  const idToken = liff.getIDToken();
  if (!idToken || isIdTokenExpired(idToken)) return null;

  return idToken;
};

/**
 * LINE 인증 화면으로 이동한다. 이 함수는 정상 동작 시 반환되지 않는다.
 *
 * LIFF access token 은 12시간, id_token 은 1시간 유효하다. 즉 isLoggedIn() 이
 * true 인데 id_token 만 만료된 구간이 존재하고, 그 상태로 login() 을 불러도
 * 만료된 id_token 이 그대로 남는다. 새 토큰을 받으려면 세션을 먼저 버려야 한다.
 */
export const startLineLogin = async (): Promise<void> => {
  const liff = await ensureLiff();
  if (liff.isLoggedIn()) liff.logout();
  liff.login({ redirectUri: window.location.href });
};

/**
 * 서버가 id_token 을 거절했을 때 세션을 버려, 다음 시도가 새 토큰으로
 * 시작되도록 한다. 우리 서비스 세션(useUserAuthStore, localStorage)과
 * LINE 앱 로그인은 건드리지 않는다.
 */
export const clearLineSession = async (): Promise<void> => {
  if (!isLineLoginConfigured()) return;
  try {
    const liff = await ensureLiff();
    if (liff.isLoggedIn()) liff.logout();
  } catch {
    // 세션 정리 실패가 로그인 흐름을 막을 이유는 없다.
  }
};
