import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import ko from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import { OrderPaymentSection } from "./OrderPaymentSection";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={ko}>
    {children}
  </NextIntlClientProvider>
);

const SLACK_UA =
  "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148 Slack/24.10";
const SAFARI_UA =
  "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1";

const setUserAgent = (ua: string) =>
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(ua);

describe("OrderPaymentSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("LINE Pay 와 ECPay 를 모두 고를 수 있다", () => {
    render(<OrderPaymentSection onChange={vi.fn()} value="ECPAY" />, {
      wrapper,
    });

    expect(screen.getByRole("radio", { name: /LINE Pay/ })).toBeEnabled();
    expect(screen.getByRole("radio", { name: /ECPay/ })).toBeEnabled();
    expect(screen.queryByText(ko.coming_soon)).toBeNull();
  });

  it("다른 앱의 인앱 브라우저에서 LINE Pay 를 고르면 안내한다", () => {
    setUserAgent(SLACK_UA);

    render(<OrderPaymentSection onChange={vi.fn()} value="LINE_PAY" />, {
      wrapper,
    });

    expect(
      screen.getByText(ko.payment_line_pay_inapp_warning),
    ).toBeInTheDocument();
  });

  it("인앱 브라우저라도 ECPay 면 안내하지 않는다", () => {
    setUserAgent(SLACK_UA);

    render(<OrderPaymentSection onChange={vi.fn()} value="ECPAY" />, {
      wrapper,
    });

    expect(screen.queryByText(ko.payment_line_pay_inapp_warning)).toBeNull();
  });

  it("일반 브라우저의 LINE Pay 는 안내하지 않는다", () => {
    setUserAgent(SAFARI_UA);

    render(<OrderPaymentSection onChange={vi.fn()} value="LINE_PAY" />, {
      wrapper,
    });

    expect(screen.queryByText(ko.payment_line_pay_inapp_warning)).toBeNull();
  });
});
