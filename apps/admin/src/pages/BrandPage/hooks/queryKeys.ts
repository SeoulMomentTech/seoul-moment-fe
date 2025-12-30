import { type BrandId } from "@shared/services/brand";

export const BRAND_QUERY_KEY = ["admin", "brand"] as const;

export const brandQueryKeys = {
  all: BRAND_QUERY_KEY,
  detail: (brandId: BrandId | number) =>
    [...BRAND_QUERY_KEY, "detail", brandId] as const,
};
