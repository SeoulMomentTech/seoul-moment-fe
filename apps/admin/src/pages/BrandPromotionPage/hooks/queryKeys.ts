export const BRAND_PROMOTION_QUERY_KEY = ["admin", "brand-promotion"] as const;

export const brandPromotionQueryKeys = {
  all: BRAND_PROMOTION_QUERY_KEY,
  list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "list", params] as const,
  detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "detail", id] as const,
} as const;
