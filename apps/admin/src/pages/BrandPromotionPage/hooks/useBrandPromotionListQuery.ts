import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionListQuery = (params?: Parameters<typeof api.getBrandPromotionList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.list(params),
    queryFn: () => api.getBrandPromotionList(params),
    enabled: true,
  });
