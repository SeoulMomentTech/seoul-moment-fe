import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import ProductGallery from "./ProductGallery";

// Swiper 더미: children 그대로 렌더
vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("swiper/modules", () => ({
  FreeMode: {},
  Navigation: {},
  Thumbs: {},
}));

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

// 모달은 open/startIndex만 노출하는 더미로 대체
vi.mock("./ProductImageZoomModal", () => ({
  default: ({ open, startIndex }: { open: boolean; startIndex: number }) =>
    open ? <div data-start={startIndex} data-testid="zoom-modal" /> : null,
}));

const IMAGES = ["/a.jpg", "/b.jpg", "/c.jpg"];

describe("ProductGallery", () => {
  it("초기에는 확대 모달이 닫혀 있다", () => {
    // when
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // then
    expect(screen.queryByTestId("zoom-modal")).not.toBeInTheDocument();
  });

  it("메인 이미지 클릭 시 해당 인덱스로 모달을 연다", () => {
    // given
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // when: 두 번째 메인 이미지 클릭
    fireEvent.click(screen.getByAltText("Test - 2"));

    // then
    const modal = screen.getByTestId("zoom-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("data-start", "1");
  });

  it("썸네일 클릭은 모달을 열지 않는다", () => {
    // given
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // when
    fireEvent.click(screen.getByAltText("Test - thumbnail 1"));

    // then
    expect(screen.queryByTestId("zoom-modal")).not.toBeInTheDocument();
  });
});
