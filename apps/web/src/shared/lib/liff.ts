import type { Liff } from "@line/liff";

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID;

export class LiffUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiffUnavailableError";
  }
}

/**
 * LIFF ID 가 주입되지 않은 환경에서는 LINE 로그인도, LINE 안 결제창 분기도 쓰지 않는다.
 * 호출부는 이 값으로 먼저 거른 뒤 `ensureLiff` 를 부른다.
 */
export const isLiffConfigured = (): boolean => Boolean(LIFF_ID);

let liffPromise: Promise<Liff> | null = null;

/**
 * LIFF SDK 를 동적 import 하고 init 을 1회만 수행한다.
 * 동적 import 라서 SDK 가 실제로 쓰는 화면(로그인·LINE 안 결제) 청크에만 들어간다.
 */
export const ensureLiff = async (): Promise<Liff> => {
  const liffId = LIFF_ID;
  if (!liffId) {
    throw new LiffUnavailableError(
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
      throw new LiffUnavailableError(
        error instanceof Error
          ? error.message
          : "LIFF SDK를 초기화하지 못했습니다.",
      );
    });

  return liffPromise;
};
