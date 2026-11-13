import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isLineInAppBrowser,
  isOtherInAppBrowser,
  openPaymentTab,
  openPaymentWindow,
  withExternalBrowser,
} from "./paymentWindow";

const navigateTo = vi.fn();
vi.mock("./navigate", () => ({ navigateTo: (url: string) => navigateTo(url) }));

const isLiffConfigured = vi.fn();
const ensureLiff = vi.fn();
vi.mock("@shared/lib/liff", () => ({
  isLiffConfigured: () => isLiffConfigured(),
  ensureLiff: () => ensureLiff(),
}));

const url = "https://pg.test/handoff/x";
const ecpay = { handoffUrl: url };
const linePay = {
  paymentUrl: "https://sandbox-web-pay.line.me/web/payment/x",
  appUrl: "line://pay/payment/x",
};
const LINE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Line/14.0.0 LIFF";
const SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

const setUserAgent = (ua: string) =>
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(ua);

describe("paymentWindow", () => {
  afterEach(() => {
    navigateTo.mockReset();
    isLiffConfigured.mockReset();
    ensureLiff.mockReset();
    vi.restoreAllMocks();
  });

  it("LINE UA 판정", () => {
    expect(isLineInAppBrowser(LINE_UA)).toBe(true);
    expect(isLineInAppBrowser(SAFARI_UA)).toBe(false);
    expect(isLineInAppBrowser("Outline/1.0")).toBe(false);
  });

  it("이미 쿼리가 있는 URL 에도 & 로 붙는다", () => {
    expect(withExternalBrowser("https://a/b?c=1")).toBe(
      "https://a/b?c=1&openExternalBrowser=1",
    );
    expect(withExternalBrowser("https://a/b")).toBe(
      "https://a/b?openExternalBrowser=1",
    );
  });

  it("다른 앱의 인앱 브라우저 판정 — LINE 은 제외", () => {
    expect(
      isOtherInAppBrowser(
        "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148 Slack/24.10",
      ),
    ).toBe(true);
    expect(
      isOtherInAppBrowser(
        "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Instagram 300.0",
      ),
    ).toBe(true);
    expect(
      isOtherInAppBrowser(
        "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/450.0]",
      ),
    ).toBe(true);
    expect(isOtherInAppBrowser("Mozilla/5.0 (iPhone) KAKAOTALK 10.0")).toBe(
      true,
    );
    expect(
      isOtherInAppBrowser(
        "Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/120 Mobile",
      ),
    ).toBe(true);
    expect(isOtherInAppBrowser(LINE_UA)).toBe(false);
    expect(isOtherInAppBrowser(SAFARI_UA)).toBe(false);
  });

  it("결제창 URL 이 없으면 null 이고 아무 데도 가지 않는다", async () => {
    setUserAgent(SAFARI_UA);

    await expect(
      openPaymentWindow({ handoffUrl: null, paymentUrl: null }),
    ).resolves.toBeNull();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  describe("LINE Pay", () => {
    it("일반 브라우저는 paymentUrl 로 같은 탭에서 간다", async () => {
      setUserAgent(SAFARI_UA);

      await expect(openPaymentWindow(linePay)).resolves.toBe("same-tab");
      expect(navigateTo).toHaveBeenCalledWith(linePay.paymentUrl);
    });

    it("LINE 안에서는 appUrl 로 가고 외부 브라우저로 넘기지 않는다", async () => {
      setUserAgent(LINE_UA);
      isLiffConfigured.mockReturnValue(true);

      await expect(openPaymentWindow(linePay)).resolves.toBe("line-app");
      expect(navigateTo).toHaveBeenCalledWith(linePay.appUrl);
      expect(ensureLiff).not.toHaveBeenCalled();
    });

    it("LINE 안인데 appUrl 이 없으면 paymentUrl 로 간다", async () => {
      setUserAgent(LINE_UA);

      await expect(
        openPaymentWindow({ ...linePay, appUrl: null }),
      ).resolves.toBe("same-tab");
      expect(navigateTo).toHaveBeenCalledWith(linePay.paymentUrl);
    });
  });

  it("일반 브라우저는 같은 탭으로 간다", async () => {
    setUserAgent(SAFARI_UA);

    await expect(openPaymentWindow(ecpay)).resolves.toBe("same-tab");
    expect(navigateTo).toHaveBeenCalledWith(url);
    expect(ensureLiff).not.toHaveBeenCalled();
  });

  it("LINE 인앱(LIFF 미설정)은 openExternalBrowser=1 을 붙여 간다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(false);

    await expect(openPaymentWindow(ecpay)).resolves.toBe("external");
    expect(navigateTo).toHaveBeenCalledWith(
      "https://pg.test/handoff/x?openExternalBrowser=1",
    );
    expect(ensureLiff).not.toHaveBeenCalled();
  });

  it("LIFF 클라이언트는 liff.openWindow external 로 연다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(true);
    const openWindow = vi.fn();
    ensureLiff.mockResolvedValue({ isInClient: () => true, openWindow });

    await expect(openPaymentWindow(ecpay)).resolves.toBe("external");
    expect(openWindow).toHaveBeenCalledWith({ url, external: true });
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("LINE 인앱인데 LIFF 클라이언트가 아니면 인앱 분기다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(true);
    ensureLiff.mockResolvedValue({
      isInClient: () => false,
      openWindow: vi.fn(),
    });

    await expect(openPaymentWindow(ecpay)).resolves.toBe("external");
    expect(navigateTo).toHaveBeenCalledWith(
      "https://pg.test/handoff/x?openExternalBrowser=1",
    );
  });

  it("LIFF init 이 실패하면 인앱 분기로 떨어진다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(true);
    ensureLiff.mockRejectedValue(new Error("init failed"));

    await expect(openPaymentWindow(ecpay)).resolves.toBe("external");
    expect(navigateTo).toHaveBeenCalledWith(
      "https://pg.test/handoff/x?openExternalBrowser=1",
    );
  });

  describe("새 탭(데스크톱)", () => {
    const fakeTab = () => {
      const doc = { title: "", body: { textContent: "" } };

      return {
        opener: {} as unknown,
        closed: false,
        close: vi.fn(),
        location: { href: "" },
        document: doc,
      };
    };

    const setPointer = (fine: boolean) =>
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: fine }));

    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    });

    it("로컬 개발 서버의 마우스 기기면 빈 탭을 먼저 열고 opener 를 끊는다", () => {
      setUserAgent(SAFARI_UA);
      setPointer(true);
      const tab = fakeTab();
      const open = vi.spyOn(window, "open").mockReturnValue(tab as never);

      expect(openPaymentTab("결제창을 여는 중…")).toBe(tab);
      expect(open).toHaveBeenCalledWith("", "_blank");
      expect(tab.opener).toBeNull();
      expect(tab.document.body.textContent).toBe("결제창을 여는 중…");
    });

    it("배포 빌드면 마우스 기기여도 열지 않는다 — 결제창은 같은 탭에서 돌아온다", () => {
      vi.stubEnv("NODE_ENV", "production");
      setUserAgent(SAFARI_UA);
      setPointer(true);
      const open = vi.spyOn(window, "open");

      expect(openPaymentTab("x")).toBeNull();
      expect(open).not.toHaveBeenCalled();
    });

    it("터치 기기면 열지 않는다", () => {
      setUserAgent(SAFARI_UA);
      setPointer(false);
      const open = vi.spyOn(window, "open");

      expect(openPaymentTab("x")).toBeNull();
      expect(open).not.toHaveBeenCalled();
    });

    it("LINE 안이면 열지 않는다", () => {
      setUserAgent(LINE_UA);
      setPointer(true);
      const open = vi.spyOn(window, "open");

      expect(openPaymentTab("x")).toBeNull();
      expect(open).not.toHaveBeenCalled();
    });

    it("팝업이 막히면 null", () => {
      setUserAgent(SAFARI_UA);
      setPointer(true);
      vi.spyOn(window, "open").mockReturnValue(null);

      expect(openPaymentTab("x")).toBeNull();
    });

    it("미리 연 탭이 있으면 그 탭을 결제창으로 보낸다", async () => {
      setUserAgent(SAFARI_UA);
      const tab = fakeTab();

      await expect(
        openPaymentWindow(ecpay, tab as unknown as Window),
      ).resolves.toBe("new-tab");
      expect(tab.location.href).toBe(url);
      expect(navigateTo).not.toHaveBeenCalled();
    });

    it("LINE Pay 도 미리 연 탭에 paymentUrl 을 연다", async () => {
      setUserAgent(SAFARI_UA);
      const tab = fakeTab();

      await expect(
        openPaymentWindow(linePay, tab as unknown as Window),
      ).resolves.toBe("new-tab");
      expect(tab.location.href).toBe(linePay.paymentUrl);
    });

    it("결제창 URL 이 없으면 미리 연 탭도 건드리지 않는다", async () => {
      setUserAgent(SAFARI_UA);
      const tab = fakeTab();

      await expect(
        openPaymentWindow({}, tab as unknown as Window),
      ).resolves.toBeNull();
      expect(tab.location.href).toBe("");
    });

    it("미리 연 탭을 사용자가 닫았으면 같은 탭으로 간다", async () => {
      setUserAgent(SAFARI_UA);
      const tab = { ...fakeTab(), closed: true };

      await expect(
        openPaymentWindow(ecpay, tab as unknown as Window),
      ).resolves.toBe("same-tab");
      expect(navigateTo).toHaveBeenCalledWith(url);
    });
  });
});
