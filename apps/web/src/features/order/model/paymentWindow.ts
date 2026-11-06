import { ensureLiff, isLiffConfigured } from "@shared/lib/liff";

import { navigateTo } from "./navigate";

/**
 * 결제창을 어디에 열었는지. `same-tab` 이 아니면 이 화면은 남아서 결과를 기다려야 한다 —
 * `external` 은 LINE 밖 브라우저, `new-tab` 은 데스크톱의 새 탭.
 */
export type PaymentWindowMode = "same-tab" | "external" | "new-tab";

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

/** 마우스 기기(데스크톱). 모바일은 탭이 쌓이면 원래 탭을 잃기 쉬워 같은 탭으로 간다 */
const isFinePointer = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: fine)").matches;

/**
 * 결제하기 클릭 순간 빈 탭을 먼저 연다. 결제창 URL 은 API 세 번 뒤에 오는데, 브라우저는
 * `await` 뒤의 `window.open` 을 팝업으로 보고 막는다 — 그래서 클릭과 같은 틱에 열어 두고
 * 나중에 주소만 바꾼다. 데스크톱이 아니거나 LINE 안이거나 팝업이 막히면 null(같은 탭).
 */
export const openPaymentTab = (loadingText: string): Window | null => {
  if (isLineInAppBrowser() || !isFinePointer()) return null;

  const tab = window.open("", "_blank");
  if (!tab) return null;

  // 결제창(외부 도메인)이 window.opener 로 이 페이지에 손대지 못하게 끊는다
  tab.opener = null;
  try {
    tab.document.title = loadingText;
    tab.document.body.textContent = loadingText;
  } catch {
    // 빈 탭에 글을 못 써도 결제 흐름과는 무관하다
  }

  return tab;
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
  /** `openPaymentTab` 으로 미리 연 탭. 있으면 그 탭을 결제창으로 보낸다 */
  paymentTab: Window | null = null,
): Promise<PaymentWindowMode> => {
  if (paymentTab && !paymentTab.closed) {
    paymentTab.location.href = handoffUrl;

    return "new-tab";
  }

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
