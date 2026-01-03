import { type AdminProductOptionListParams } from "@shared/services/productOption";

export const PRODUCT_OPTION_QUERY_KEY = ["admin", "productOptions"] as const;

export const productOptionQueryKeys = {
  all: PRODUCT_OPTION_QUERY_KEY,
  list: (params?: AdminProductOptionListParams) =>
    [...PRODUCT_OPTION_QUERY_KEY, "list", params] as const,
};
