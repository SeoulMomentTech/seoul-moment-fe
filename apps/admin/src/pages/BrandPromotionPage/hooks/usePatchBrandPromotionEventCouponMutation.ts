import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const usePatchBrandPromotionEventCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof api.patchBrandPromotionEventCoupon>[1] }) =>
      api.patchBrandPromotionEventCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.events.coupons.all });
    },
  });
};
