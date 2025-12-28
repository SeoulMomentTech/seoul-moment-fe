import {
  type AdminProductCategoryListParams,
  type ProductCategoryId,
} from "@shared/services/productCategory";

export const PRODUCT_CATEGORY_QUERY_KEY = ["admin", "productCategories"] as const;

export const productCategoryQueryKeys = {
  all: PRODUCT_CATEGORY_QUERY_KEY,
  list: (params?: AdminProductCategoryListParams) =>
    [...PRODUCT_CATEGORY_QUERY_KEY, "list", params] as const,
  detail: (productCategoryId: ProductCategoryId | number) =>
    [...PRODUCT_CATEGORY_QUERY_KEY, "detail", productCategoryId] as const,
};
