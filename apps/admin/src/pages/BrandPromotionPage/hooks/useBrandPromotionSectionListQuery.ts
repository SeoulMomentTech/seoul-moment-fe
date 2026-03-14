import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionSectionListQuery = (params?: Parameters<typeof api.getBrandPromotionSectionList>[0]) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.sections.list(params),
    queryFn: () => api.getBrandPromotionSectionList(params),
    enabled: true,
  });
