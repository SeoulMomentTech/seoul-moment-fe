import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import { CartBenefitProgress } from "./CartBenefitProgress";

const renderWithIntl = (ui: ReactNode) =>
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe("CartBenefitProgress", () => {
  it("기준에 못 미치면 남은 금액을 안내하고 바를 그만큼 채운다", () => {
    renderWithIntl(
      <CartBenefitProgress amount={600} freeShippingThreshold={1500} />,
    );

    expect(screen.getByText(/900 더 담으면 무료배송/)).toBeInTheDocument();
    expect(screen.queryByText(messages.free_shipping_achieved)).toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "600",
    );
  });

  it("기준 이상이면 무료배송 적용을 보여준다", () => {
    renderWithIntl(
      <CartBenefitProgress amount={2000} freeShippingThreshold={1500} />,
    );

    expect(
      screen.getByText(messages.free_shipping_achieved),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1500",
    );
  });

  it("아무것도 고르지 않았으면 적용으로 보이지 않는다", () => {
    renderWithIntl(
      <CartBenefitProgress amount={0} freeShippingThreshold={1500} />,
    );

    expect(screen.queryByText(messages.free_shipping_achieved)).toBeNull();
    expect(screen.getByText(/1,500 더 담으면 무료배송/)).toBeInTheDocument();
  });

  it("무료배송 기준이 없으면 카드를 그리지 않는다", () => {
    const { container } = renderWithIntl(
      <CartBenefitProgress amount={600} freeShippingThreshold={0} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
