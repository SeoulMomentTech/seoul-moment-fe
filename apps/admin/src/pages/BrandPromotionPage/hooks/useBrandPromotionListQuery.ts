import { useAppQuery } from "@shared/hooks/useAppQuery";
import * as api from "@shared/services/brandPromotion";



import { brandPromotionQueryKeys } from "./queryKeys";

export const useBrandPromotionListQuery = (params?: Parameters<typeof api.getBrandPromotionList>[0]) =>
  useAppQuery({
    queryKey: brandPromotionQueryKeys.list(params),
    queryFn: () => api.getBrandPromotionList(params),
    enabled: true,
  });
