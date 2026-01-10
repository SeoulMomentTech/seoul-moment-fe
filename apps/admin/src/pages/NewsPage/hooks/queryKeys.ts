import {
  type AdminNewsId,
  type AdminNewsListParams,
} from "@shared/services/news";

export const NEWS_QUERY_KEY = ["admin", "news"] as const;

export const newsQueryKeys = {
  all: NEWS_QUERY_KEY,
  list: (params?: AdminNewsListParams) =>
    [...NEWS_QUERY_KEY, "list", params] as const,
  detail: (newsId: AdminNewsId | number) =>
    [...NEWS_QUERY_KEY, "detail", newsId] as const,
};
