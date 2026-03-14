import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionNoticsDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.notics.detail(id),
    queryFn: () => api.getBrandPromotionNoticsDetail(id),
    enabled: !!id,
  });
