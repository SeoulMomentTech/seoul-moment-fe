import { describe, expect, it, vi } from "vitest";

import type { News } from "@shared/services/news";

import { render, screen } from "@testing-library/react";

import { NewsContents } from "./News.client";

// Mocks
vi.mock("@entities/news/ui", () => ({
  FeaturedMainNewsCard: () => <div data-testid="main-news-card" />,
  FeaturedSubNewsCard: () => <div data-testid="sub-news-card" />,
}));

vi.mock("@widgets/empty", () => ({
  Empty: ({ description }: { description: string }) => (
    <div data-testid="empty-state">{description}</div>
  ),
}));

// Mock Link to avoid routing errors
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("NewsContents", () => {
  it("renders empty state when data is empty", () => {
    // given
    const data: News[] = [];

    // when
    render(<NewsContents data={data} />);

    // then
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("등록된 뉴스가 없습니다.")).toBeInTheDocument();
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
      },
      {
        id: 2,
        title: "News 2",
        writer: "Author 2",
        createDate: "2023-01-02",
        homeImage: "img2",
        image: "",
        content: "Sub 2",
      },
    ];

    // when
    render(<NewsContents data={data} />);

    // then
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByTestId("main-news-card")).toBeInTheDocument();
    expect(screen.getByTestId("sub-news-card")).toBeInTheDocument();
  });
});
