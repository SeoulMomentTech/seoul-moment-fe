import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { fireEvent, render, screen } from "@testing-library/react";

// 미디어 쿼리(모바일 여부)와 스토어 close 를 테스트마다 제어한다.
let isMobile = true;
const close = vi.fn();

vi.mock("@shared/lib/hooks", () => ({
  useMediaQuery: () => isMobile,
  useBodyScrollLock: () => {},
}));
vi.mock("../model/useChatbotStore", () => ({
  useChatbotStore: () => ({ isOpen: true, close }),
}));
vi.mock("../model/useChatbotConversation", () => ({
  useChatbotConversation: () => ({
    messages: [],
    send: vi.fn(),
    retry: vi.fn(),
    isPending: false,
    isRateLimited: false,
  }),
}));
vi.mock("../api/useGetAiConsultSuggestionsQuery", () => ({
  useGetAiConsultSuggestionsQuery: () => ({
    data: { list: [] },
    status: "success",
  }),
}));
// 메시지 목록 자리에 이동 링크(a[href])와 일반 컨트롤(button)을 하나씩 둔다.
vi.mock("./ChatMessageList", () => ({
  default: () => (
    <div>
      <a href="#product">product link</a>
      <button type="button">chip</button>
    </div>
  ),
}));
vi.mock("./ChatComposer", () => ({ default: () => <div /> }));
vi.mock("./RateLimitBanner", () => ({ default: () => null }));
vi.mock("./OfflineBanner", () => ({ default: () => null }));

// 위 mock 이 적용된 뒤 import 되도록 정적 import 대신 동적 import 를 쓴다.
const { default: ChatbotPanel } = await import("./ChatbotPanel");

function renderPanel() {
  const triggerRef = { current: null };

  return render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      <ChatbotPanel triggerRef={triggerRef} />
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  close.mockClear();
  isMobile = true;
});

describe("ChatbotPanel — 모바일 링크 이동 시 닫힘", () => {
  it("모바일에서 패널 안 링크를 누르면 패널을 닫는다", () => {
    isMobile = true;
    renderPanel();

    fireEvent.click(screen.getByText("product link"));

    expect(close).toHaveBeenCalledTimes(1);
  });

  it("모바일에서 링크가 아닌 컨트롤(칩)을 눌러도 닫지 않는다", () => {
    isMobile = true;
    renderPanel();

    fireEvent.click(screen.getByText("chip"));

    expect(close).not.toHaveBeenCalled();
  });

  it("데스크톱에서는 링크를 눌러도 패널을 열어 둔다(F-2)", () => {
    isMobile = false;
    renderPanel();

    fireEvent.click(screen.getByText("product link"));

    expect(close).not.toHaveBeenCalled();
  });
});
