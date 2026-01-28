import { type GetAdminProductListParams } from "@shared/services/adminProduct";

export const ADMIN_PRODUCT_QUERY_KEY = ["admin", "product"] as const;

export const adminProductQueryKeys = {
  all: ADMIN_PRODUCT_QUERY_KEY,
  list: (params: GetAdminProductListParams) =>
    [...ADMIN_PRODUCT_QUERY_KEY, "list", params] as const,
  detail: (id: number) => [...ADMIN_PRODUCT_QUERY_KEY, "detail", id] as const,
};
