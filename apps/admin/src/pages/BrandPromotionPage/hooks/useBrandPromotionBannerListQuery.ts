import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionBannerListQuery = (params?: Parameters<typeof api.getBrandPromotionBannerList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.banners.list(params),
    queryFn: () => api.getBrandPromotionBannerList(params),
    enabled: true,
  });
