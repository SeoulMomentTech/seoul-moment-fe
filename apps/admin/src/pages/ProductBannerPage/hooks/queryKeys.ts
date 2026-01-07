import {
  type AdminProductBannerListParams,
  type ProductBannerId,
} from "@shared/services/productBanner";

export const PRODUCT_BANNER_QUERY_KEY = ["admin", "product-banner"] as const;

export const productBannerQueryKeys = {
  all: PRODUCT_BANNER_QUERY_KEY,
  list: (params?: AdminProductBannerListParams) =>
    [...PRODUCT_BANNER_QUERY_KEY, "list", params] as const,
  detail: (bannerId: ProductBannerId | number) =>
    [...PRODUCT_BANNER_QUERY_KEY, "detail", bannerId] as const,
};
