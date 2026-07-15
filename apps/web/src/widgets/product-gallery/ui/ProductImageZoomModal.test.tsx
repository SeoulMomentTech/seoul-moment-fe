import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import ProductImageZoomModal from "./ProductImageZoomModal";

const useMediaQueryMock = vi.fn();

vi.mock("@shared/lib/hooks", () => ({
  useMediaQuery: () => useMediaQueryMock(),
}));

// Swiper는 jsdom에서 동작하지 않으므로 children을 그대로 렌더하는 더미로 대체
vi.mock("swiper/react", () => ({
  Swiper: ({
    children,
    initialSlide,
  }: {
    children: ReactNode;
    initialSlide?: number;
  }) => (
    <div data-initial-slide={initialSlide} data-testid="swiper">
      {children}
    </div>
  ),
  SwiperSlide: ({ children }: { children: ReactNode }) => (
    <div data-testid="slide">{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({
  Zoom: {},
  Navigation: {},
  Pagination: {},
}));

// next/image → 순수 img
vi.mock("next/image", () => ({
  default: ({
    priority,
    fill,
    ...props
  }: Record<string, unknown> & {
    priority?: boolean;
    fill?: boolean;
  }) => {
    void priority;
    void fill;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as object)} />;
  },
}));

const IMAGES = ["/a.jpg", "/b.jpg", "/c.jpg"];

const renderModal = (ui: ReactNode) =>
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe("ProductImageZoomModal", () => {
  beforeEach(() => {
    useMediaQueryMock.mockReset();
  });

  it("데스크톱에서 dialog role과 이미지 개수만큼 슬라이드를 렌더한다", () => {
    // given
    useMediaQueryMock.mockReturnValue(false);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={true}
        productName="Test"
        startIndex={0}
      />,
    );

    // then
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByTestId("slide")).toHaveLength(IMAGES.length);
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it("모바일에서 닫기 버튼(aria-label=닫기)을 렌더한다", () => {
    // given
    useMediaQueryMock.mockReturnValue(true);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={true}
        productName="Test"
        startIndex={1}
      />,
    );

    // then
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.getAllByTestId("slide")).toHaveLength(IMAGES.length);
    expect(screen.getByTestId("swiper")).toHaveAttribute(
      "data-initial-slide",
      "1",
    );
  });

  it("닫혀 있으면 아무것도 렌더하지 않는다", () => {
    // given
    useMediaQueryMock.mockReturnValue(false);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={false}
        productName="Test"
        startIndex={0}
      />,
    );

    // then
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryAllByTestId("slide")).toHaveLength(0);
  });
});
