import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionBannerDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.banners.detail(id),
    queryFn: () => api.getBrandPromotionBannerDetail(id),
    enabled: !!id,
  });
