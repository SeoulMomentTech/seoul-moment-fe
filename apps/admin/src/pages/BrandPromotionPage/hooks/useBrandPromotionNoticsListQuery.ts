import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionNoticsListQuery = (params?: Parameters<typeof api.getBrandPromotionNoticsList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.notics.list(params),
    queryFn: () => api.getBrandPromotionNoticsList(params),
    enabled: true,
  });
