import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { News } from "@shared/services/news";

import messages from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import { NewsContents } from "./News.client";

// Mocks
vi.mock("@entities/news/ui", () => ({
  FeaturedMainNewsCard: () => <div data-testid="main-news-card" />,
  FeaturedSubNewsCard: () => <div data-testid="sub-news-card" />,
}));

vi.mock("@widgets/empty", () => ({
  Empty: ({
    description,
    icon,
  }: {
    description: string;
    icon: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      {icon}
      <span>{description}</span>
    </div>
  ),
}));

// Mock Link to avoid routing errors
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Provide real ko messages so useTranslations resolves actual strings
const renderWithIntl = (ui: ReactNode) =>
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe("NewsContents", () => {
  it("renders empty state with correct icon and message when data is empty", () => {
    // given
    const data: News[] = [];

    // when
    renderWithIntl(<NewsContents data={data} />);

    // then
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("등록된 뉴스가 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders news cards when data is provided", () => {
    // given
    const data: News[] = [
      {
        id: 1,
        title: "News 1",
        writer: "Author 1",
        createDate: "2023-01-01",
        homeImage: "img1",
        image: "",
        content: "Sub 1",
        newsCategoryName: "Category 1",
      },
      {
        id: 2,
        title: "News 2",
        writer: "Author 2",
        createDate: "2023-01-02",
        homeImage: "img2",
        image: "",
        content: "Sub 2",
        newsCategoryName: "Category 2",
      },
    ];

    // when
    renderWithIntl(<NewsContents data={data} />);

    // then
    // NewsContents renders both desktop and mobile sliders, so cards appear more than once
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("main-news-card").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("sub-news-card").length).toBeGreaterThan(0);
  });
});
