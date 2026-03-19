import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.detail(id),
    queryFn: () => api.getBrandPromotionDetail(id),
    enabled: !!id,
  });
