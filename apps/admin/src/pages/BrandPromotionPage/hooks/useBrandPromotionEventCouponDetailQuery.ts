import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionEventCouponDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.events.coupons.detail(id),
    queryFn: () => api.getBrandPromotionEventCouponDetail(id),
    enabled: !!id,
  });
