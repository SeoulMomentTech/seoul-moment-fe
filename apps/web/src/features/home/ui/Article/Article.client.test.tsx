import { describe, expect, it, vi } from "vitest";

import type { Article } from "@/shared/services/article";

import { render, screen } from "@testing-library/react";

import { ArticleContents } from "./Article.client";

// Mocks
vi.mock("@widgets/article-list", () => ({
  ArticleList: () => <div data-testid="article-list" />,
}));

vi.mock("@widgets/article-slide", () => ({
  ArticleSlide: () => <div data-testid="article-slide" />,
}));

vi.mock("@widgets/empty", () => ({
  Empty: ({ description }: { description: string }) => (
    <div data-testid="empty-state">{description}</div>
  ),
}));

describe("ArticleContents", () => {
  it("renders empty state when data is empty", () => {
    // given
    const data: Article[] = [];

    // when
    render(<ArticleContents data={data} />);

    // then
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("등록된 아티클이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("article-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("article-slide")).not.toBeInTheDocument();
  });

  it("renders article list and slide when data is provided", () => {
    // given
    const data: Article[] = [
      {
        id: 1,
        title: "Article 1",
        writer: "Author 1",
        createDate: "2023-01-01",
        homeImage: "img1",
        image: "",
        content: "Sub 1",
      },
    ];

    // when
    render(<ArticleContents data={data} />);

    // then
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByTestId("article-list")).toBeInTheDocument();
    expect(screen.getByTestId("article-slide")).toBeInTheDocument();
  });
});
