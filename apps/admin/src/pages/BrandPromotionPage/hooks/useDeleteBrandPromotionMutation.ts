import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useDeleteBrandPromotionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBrandPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.all });
    },
  });
};
