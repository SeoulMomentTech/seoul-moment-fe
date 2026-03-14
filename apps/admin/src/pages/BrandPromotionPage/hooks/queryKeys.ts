export const BRAND_PROMOTION_QUERY_KEY = ["admin", "brand-promotion"] as const;

export const brandPromotionQueryKeys = {
  all: BRAND_PROMOTION_QUERY_KEY,
  list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "list", params] as const,
  detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "detail", id] as const,
  
  sections: {
    all: [...BRAND_PROMOTION_QUERY_KEY, "sections"] as const,
    list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "sections", "list", params] as const,
    detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "sections", "detail", id] as const,
  },
  
  banners: {
    all: [...BRAND_PROMOTION_QUERY_KEY, "banners"] as const,
    list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "banners", "list", params] as const,
    detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "banners", "detail", id] as const,
  },
  
  notics: {
    all: [...BRAND_PROMOTION_QUERY_KEY, "notics"] as const,
    list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "notics", "list", params] as const,
    detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "notics", "detail", id] as const,
  },
  
  popups: {
    all: [...BRAND_PROMOTION_QUERY_KEY, "popups"] as const,
    list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "popups", "list", params] as const,
    detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "popups", "detail", id] as const,
  },
  
  events: {
    all: [...BRAND_PROMOTION_QUERY_KEY, "events"] as const,
    list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "events", "list", params] as const,
    detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "events", "detail", id] as const,
    
    coupons: {
      all: [...BRAND_PROMOTION_QUERY_KEY, "events", "coupons"] as const,
      list: (params?: unknown) => [...BRAND_PROMOTION_QUERY_KEY, "events", "coupons", "list", params] as const,
      detail: (id: number) => [...BRAND_PROMOTION_QUERY_KEY, "events", "coupons", "detail", id] as const,
    },
  },
} as const;
