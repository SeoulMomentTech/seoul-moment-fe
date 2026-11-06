import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isLineInAppBrowser,
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
});
