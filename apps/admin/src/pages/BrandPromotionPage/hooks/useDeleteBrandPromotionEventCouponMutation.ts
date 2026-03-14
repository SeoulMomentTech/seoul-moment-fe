import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useDeleteBrandPromotionEventCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBrandPromotionEventCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.events.coupons.all });
    },
  });
};
