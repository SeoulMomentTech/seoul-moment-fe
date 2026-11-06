import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isLineInAppBrowser,
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

  it("일반 브라우저는 같은 탭으로 간다", async () => {
    setUserAgent(SAFARI_UA);

    await expect(openPaymentWindow(url)).resolves.toBe("same-tab");
    expect(navigateTo).toHaveBeenCalledWith(url);
    expect(ensureLiff).not.toHaveBeenCalled();
  });

  it("LINE 인앱(LIFF 미설정)은 openExternalBrowser=1 을 붙여 간다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(false);

    await expect(openPaymentWindow(url)).resolves.toBe("external");
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

    await expect(openPaymentWindow(url)).resolves.toBe("external");
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

    await expect(openPaymentWindow(url)).resolves.toBe("external");
    expect(navigateTo).toHaveBeenCalledWith(
      "https://pg.test/handoff/x?openExternalBrowser=1",
    );
  });

  it("LIFF init 이 실패하면 인앱 분기로 떨어진다", async () => {
    setUserAgent(LINE_UA);
    isLiffConfigured.mockReturnValue(true);
    ensureLiff.mockRejectedValue(new Error("init failed"));

    await expect(openPaymentWindow(url)).resolves.toBe("external");
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

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("마우스 기기면 빈 탭을 먼저 열고 opener 를 끊는다", () => {
      setUserAgent(SAFARI_UA);
      setPointer(true);
      const tab = fakeTab();
      const open = vi.spyOn(window, "open").mockReturnValue(tab as never);

      expect(openPaymentTab("결제창을 여는 중…")).toBe(tab);
      expect(open).toHaveBeenCalledWith("", "_blank");
      expect(tab.opener).toBeNull();
      expect(tab.document.body.textContent).toBe("결제창을 여는 중…");
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
        openPaymentWindow(url, tab as unknown as Window),
      ).resolves.toBe("new-tab");
      expect(tab.location.href).toBe(url);
      expect(navigateTo).not.toHaveBeenCalled();
    });

    it("미리 연 탭을 사용자가 닫았으면 같은 탭으로 간다", async () => {
      setUserAgent(SAFARI_UA);
      const tab = { ...fakeTab(), closed: true };

      await expect(
        openPaymentWindow(url, tab as unknown as Window),
      ).resolves.toBe("same-tab");
      expect(navigateTo).toHaveBeenCalledWith(url);
    });
  });
});
