import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useDeleteBrandPromotionNoticsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBrandPromotionNotics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.notics.all });
    },
  });
};
