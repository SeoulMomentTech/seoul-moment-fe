import {
  type AdminArticleId,
  type AdminArticleListParams,
} from "@shared/services/article";

export const ARTICLE_QUERY_KEY = ["admin", "articles"] as const;

export const articleQueryKeys = {
  all: ARTICLE_QUERY_KEY,
  list: (params?: AdminArticleListParams) =>
    [...ARTICLE_QUERY_KEY, "list", params] as const,
  detail: (articleId: AdminArticleId | number) =>
    [...ARTICLE_QUERY_KEY, "detail", articleId] as const,
};
