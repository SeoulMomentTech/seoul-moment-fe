import { ensureLiff, isLiffConfigured } from "@shared/lib/liff";

import { navigateTo } from "./navigate";

/** 결제창을 어디에 열었는지. `external` 이면 이 화면은 남아서 결과를 기다려야 한다 */
export type PaymentWindowMode = "same-tab" | "external";

/** LINE 인앱 브라우저(LIFF 뷰 포함)의 UA 는 `Line/버전` 토큰을 품는다 */
export const isLineInAppBrowser = (
  userAgent: string = typeof navigator === "undefined"
    ? ""
    : navigator.userAgent,
): boolean => /\bLine\//.test(userAgent);

/** LINE 인앱 브라우저가 이 링크를 기본 브라우저로 넘기게 하는 쿼리 */
export const withExternalBrowser = (url: string): string => {
  const next = new URL(url);
  next.searchParams.set("openExternalBrowser", "1");

  return next.toString();
};

/**
 * ECPay 결제창(`handoffUrl`)으로 보낸다.
 *
 * LINE 안에서는 인앱 브라우저로 결제가 깨질 수 있어 외부 브라우저로 넘긴다 — LIFF 뷰면
 * `liff.openWindow(external)`, 그 밖 LINE 인앱이면 `?openExternalBrowser=1`(LIFF 에서는 안 먹는다).
 * LINE 밖 사용자는 SDK 를 내려받지 않고 같은 탭으로 간다.
 */
export const openPaymentWindow = async (
  handoffUrl: string,
): Promise<PaymentWindowMode> => {
  if (!isLineInAppBrowser()) {
    navigateTo(handoffUrl);

    return "same-tab";
  }

  if (isLiffConfigured()) {
    try {
      const liff = await ensureLiff();

      if (liff.isInClient()) {
        liff.openWindow({ url: handoffUrl, external: true });

        return "external";
      }
    } catch {
      // init 실패는 LIFF 뷰가 아니라는 뜻으로 보고 인앱 분기로 간다
    }
  }

  navigateTo(withExternalBrowser(handoffUrl));

  return "external";
};
