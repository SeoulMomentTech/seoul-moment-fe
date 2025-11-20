import {
  type AdminCategoryListParams,
  type CategoryId,
} from "@shared/services/category";

export const CATEGORY_QUERY_KEY = ["admin", "categories"] as const;

export const categoryQueryKeys = {
  all: CATEGORY_QUERY_KEY,
  list: (params?: AdminCategoryListParams) =>
    [...CATEGORY_QUERY_KEY, "list", params] as const,
  detail: (categoryId: CategoryId | number) =>
    [...CATEGORY_QUERY_KEY, "detail", categoryId] as const,
};
