import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionEventListQuery = (params?: Parameters<typeof api.getBrandPromotionEventList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.events.list(params),
    queryFn: () => api.getBrandPromotionEventList(params),
    enabled: true,
  });
