import { useAppQuery } from "@shared/hooks/useAppQuery";
import * as api from "@shared/services/brandPromotion";


import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionDetailQuery = (id: number) =>
  useAppQuery({
    queryKey: brandPromotionQueryKeys.detail(id),
    queryFn: () => api.getBrandPromotionDetail(id),
    enabled: !!id,
  });
