import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionEventDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.events.detail(id),
    queryFn: () => api.getBrandPromotionEventDetail(id),
    enabled: !!id,
  });
