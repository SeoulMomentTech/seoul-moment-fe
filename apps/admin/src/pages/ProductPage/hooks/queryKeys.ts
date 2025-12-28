import { type AdminProductItemListParams } from "@shared/services/products";

export const PRODUCT_QUERY_KEY = ["admin", "products"] as const;

export const productQueryKeys = {
  all: PRODUCT_QUERY_KEY,
  list: (params?: AdminProductItemListParams) =>
    [...PRODUCT_QUERY_KEY, "list", params] as const,
};
