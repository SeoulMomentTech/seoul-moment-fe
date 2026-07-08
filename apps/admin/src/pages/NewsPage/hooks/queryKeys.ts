import {
  type AdminNewsCategoryId,
  type AdminNewsHashtagId,
  type AdminNewsId,
  type AdminNewsListParams,
} from "@shared/services/news";

export const NEWS_QUERY_KEY = ["admin", "news"] as const;
export const NEWS_CATEGORY_QUERY_KEY = [
  ...NEWS_QUERY_KEY,
  "category",
] as const;
export const NEWS_HASHTAG_QUERY_KEY = [...NEWS_QUERY_KEY, "hashtag"] as const;

export const newsQueryKeys = {
  all: NEWS_QUERY_KEY,
  list: (params?: AdminNewsListParams) =>
    [...NEWS_QUERY_KEY, "list", params] as const,
  detail: (newsId: AdminNewsId | number) =>
    [...NEWS_QUERY_KEY, "detail", newsId] as const,
  detailV1: (newsId: AdminNewsId | number) =>
    [...NEWS_QUERY_KEY, "detail", "v1", newsId] as const,
};

export const newsCategoryQueryKeys = {
  all: NEWS_CATEGORY_QUERY_KEY,
  list: () => [...NEWS_CATEGORY_QUERY_KEY, "list"] as const,
  detail: (categoryId: AdminNewsCategoryId | number) =>
    [...NEWS_CATEGORY_QUERY_KEY, "detail", categoryId] as const,
};

export const newsHashtagQueryKeys = {
  all: NEWS_HASHTAG_QUERY_KEY,
  list: () => [...NEWS_HASHTAG_QUERY_KEY, "list"] as const,
  detail: (hashtagId: AdminNewsHashtagId | number) =>
    [...NEWS_HASHTAG_QUERY_KEY, "detail", hashtagId] as const,
};
