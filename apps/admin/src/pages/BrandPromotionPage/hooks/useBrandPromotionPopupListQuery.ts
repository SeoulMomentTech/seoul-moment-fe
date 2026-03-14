import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionPopupListQuery = (params?: Parameters<typeof api.getBrandPromotionPopupList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.popups.list(params),
    queryFn: () => api.getBrandPromotionPopupList(params),
    enabled: true,
  });
