import * as api from "@shared/services/brandPromotion";

import { useQuery } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionSectionDetailQuery = (id: number) =>
  useQuery({
    queryKey: brandPromotionQueryKeys.sections.detail(id),
    queryFn: () => api.getBrandPromotionSectionDetail(id),
    enabled: !!id,
  });
