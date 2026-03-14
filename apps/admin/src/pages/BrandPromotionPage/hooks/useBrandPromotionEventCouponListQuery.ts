import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionEventCouponListQuery = (params?: Parameters<typeof api.getBrandPromotionEventCouponList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.events.coupons.list(params),
    queryFn: () => api.getBrandPromotionEventCouponList(params),
    enabled: true,
  });
