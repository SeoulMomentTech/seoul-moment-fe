import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import ko from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import { OrderPaymentSection } from "./OrderPaymentSection";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={ko}>
    {children}
  </NextIntlClientProvider>
);

describe("OrderPaymentSection", () => {
  it("LINE Pay 는 비활성이고 준비 중 문구가 붙는다", () => {
    render(<OrderPaymentSection onChange={vi.fn()} value="ECPAY" />, {
      wrapper,
    });

    expect(screen.getByRole("radio", { name: /LINE Pay/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /ECPay/ })).toBeEnabled();
    expect(screen.getByText(ko.coming_soon)).toBeInTheDocument();
  });
});
