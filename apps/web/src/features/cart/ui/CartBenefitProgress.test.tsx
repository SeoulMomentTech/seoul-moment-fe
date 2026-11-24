import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, screen, type Matcher } from "@testing-library/react";

import { CartBenefitProgress } from "./CartBenefitProgress";

const renderWithIntl = (ui: ReactNode) =>
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

/** 남은 금액을 강조 요소로 감싸 문단이 여러 노드로 나뉘므로 문단 전체 글자로 찾는다 */
const paragraph =
  (text: string | RegExp): Matcher =>
  (_, element) =>
    element?.tagName === "P" &&
    (typeof text === "string"
      ? element.textContent === text
      : text.test(element.textContent ?? ""));

describe("CartBenefitProgress", () => {
  it("기준에 못 미치면 남은 금액을 안내하고 바를 그만큼 채운다", () => {
    renderWithIntl(
      <CartBenefitProgress amount={600} freeShippingThreshold={1500} />,
    );

    expect(
      screen.getByText(paragraph("NT$900 더 담으면 무료배송")),
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(paragraph("NT$1,500 더 담으면 무료배송")),
    ).toBeInTheDocument();
  });

  it("할인 구간이 켜져 있으면 서버 값으로 다음 구간까지 잰다", () => {
    renderWithIntl(
      <CartBenefitProgress
        amount={600}
        discount={{
          amount: 3640,
          internationalDiscount: 120,
          nextDiscountThreshold: 5000,
          nextDiscountAmount: 250,
          amountToNextDiscount: 1360,
        }}
        freeShippingThreshold={1500}
      />,
    );

    // 무료배송은 이미 받고 있으므로 다음 구간 안내에는 할인만 들어간다
    expect(
      screen.getByText(paragraph("NT$1,360 더 담으면 NT$250 할인")),
    ).toBeInTheDocument();
    expect(
      screen.getByText("NT$120 할인과 본섬 무료배송 적용 중"),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "3640",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "5000",
    );
    expect(screen.getByText("NT$1,360").tagName).toBe("STRONG");
    expect(
      screen.getByText(paragraph("3,640 / 5,000 · 다음 혜택 NT$250")),
    ).toBeInTheDocument();
  });

  it("다음 구간이 무료배송 기준을 함께 넘으면 할인과 무료배송을 한 문장으로 안내한다", () => {
    renderWithIntl(
      <CartBenefitProgress
        amount={900}
        discount={{
          amount: 900,
          internationalDiscount: 0,
          nextDiscountThreshold: 1500,
          nextDiscountAmount: 120,
          amountToNextDiscount: 600,
        }}
        freeShippingThreshold={1150}
      />,
    );

    expect(
      screen.getByText(
        paragraph("NT$600 더 담으면 NT$120 할인과 본섬 무료배송"),
      ),
    ).toBeInTheDocument();
  });

  it("마지막 할인 구간이면 남은 금액 안내 없이 적용만 보여준다", () => {
    renderWithIntl(
      <CartBenefitProgress
        amount={13000}
        discount={{
          amount: 13000,
          internationalDiscount: 700,
          nextDiscountThreshold: null,
          nextDiscountAmount: null,
          amountToNextDiscount: 0,
        }}
        freeShippingThreshold={1500}
      />,
    );

    expect(
      screen.getByText("NT$700 할인과 본섬 무료배송 적용 중"),
    ).toBeInTheDocument();
    expect(screen.queryByText(paragraph(/더 담으면/))).toBeNull();
  });

  it("할인 구간이 꺼져 있으면 무료배송 진행도로 돌아간다", () => {
    renderWithIntl(
      <CartBenefitProgress
        amount={600}
        discount={{
          amount: 600,
          internationalDiscount: 0,
          nextDiscountThreshold: null,
          nextDiscountAmount: null,
          amountToNextDiscount: 0,
        }}
        freeShippingThreshold={1500}
      />,
    );

    expect(
      screen.getByText(paragraph("NT$900 더 담으면 무료배송")),
    ).toBeInTheDocument();
  });

  it("무료배송 기준이 없으면 카드를 그리지 않는다", () => {
    const { container } = renderWithIntl(
      <CartBenefitProgress amount={600} freeShippingThreshold={0} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
