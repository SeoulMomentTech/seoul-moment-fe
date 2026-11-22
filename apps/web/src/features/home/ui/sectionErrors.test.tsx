import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render } from "@testing-library/react";

import Article from "./Article";
import News from "./News";
import NowOnSale from "./NowOnSale";

vi.mock("next-intl/server", () => ({ getLocale: async () => "ko" }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));

vi.mock("@shared/services/product", () => ({
  getProductList: () => Promise.reject(new Error("Request timed out")),
}));
vi.mock("@shared/services/news", () => ({
  getNewsList: () => Promise.reject(new Error("Request timed out")),
}));
vi.mock("@shared/services/article", () => ({
  getArticleList: () => Promise.reject(new Error("Request timed out")),
}));

// 섹션 하나의 API 가 실패해도 홈 전체가 에러 페이지로 넘어가지 않고
// 그 섹션만 빠져야 한다
describe("홈 섹션 API 실패", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["NowOnSale", NowOnSale],
    ["News", News],
    ["Article", Article],
  ])("%s 는 요청이 실패하면 섹션을 비운다", async (_, Section) => {
    const ui = await Section();
    const { container } = await act(async () => render(ui));

    expect(container).toBeEmptyDOMElement();
  });
});
