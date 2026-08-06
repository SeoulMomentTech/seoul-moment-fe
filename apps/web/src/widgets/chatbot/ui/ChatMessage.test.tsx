import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import type { ChatbotMessage } from "../model/types";

// 모바일 여부를 테스트마다 제어한다.
let isMobile = false;

vi.mock("@shared/lib/hooks", () => ({
  useMediaQuery: () => isMobile,
}));
// next-intl Link 를 target/rel 을 그대로 통과시키는 anchor 로 대체한다.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    target,
    rel,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    rel?: string;
  }) => (
    <a href={href} rel={rel} target={target}>
      {children}
    </a>
  ),
}));

const { default: ChatMessage } = await import("./ChatMessage");

const noop = () => {};

function renderMessage(message: ChatbotMessage) {
  return render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      <ChatMessage message={message} onRetry={noop} onSelectSuggestion={noop} />
    </NextIntlClientProvider>,
  );
}

const productMessage: ChatbotMessage = {
  id: "1",
  role: "bot",
  text: "이런 상품이 있어요.",
  tag: "PRODUCT_LIST",
  products: [
    {
      id: 132,
      name: "테스트 상품",
      brandName: "브랜드",
      price: 1000,
      image: null,
    },
  ],
};

const fallbackMessage: ChatbotMessage = {
  id: "2",
  role: "bot",
  text: "답변드리기 어려워요.",
  tag: "FALLBACK",
};

afterEach(() => {
  isMobile = false;
});

describe("ChatMessage — 모바일에서 링크를 새 탭으로 연다", () => {
  it("모바일에서 상품 링크를 새 탭(target=_blank)으로 연다", () => {
    isMobile = true;
    renderMessage(productMessage);

    const link = screen.getByText("테스트 상품").closest("a");

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("데스크톱에서는 상품 링크를 같은 탭으로 연다(target 없음)", () => {
    isMobile = false;
    renderMessage(productMessage);

    const link = screen.getByText("테스트 상품").closest("a");

    expect(link).not.toHaveAttribute("target");
  });

  it("모바일에서 문의 링크도 새 탭으로 연다", () => {
    isMobile = true;
    const { container } = renderMessage(fallbackMessage);

    const contactLink = container.querySelector('a[href="/contact"]');

    expect(contactLink).toHaveAttribute("target", "_blank");
  });
});
