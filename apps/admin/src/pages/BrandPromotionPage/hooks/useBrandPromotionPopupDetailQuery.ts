import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionPopupDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.popups.detail(id),
    queryFn: () => api.getBrandPromotionPopupDetail(id),
    enabled: !!id,
  });
