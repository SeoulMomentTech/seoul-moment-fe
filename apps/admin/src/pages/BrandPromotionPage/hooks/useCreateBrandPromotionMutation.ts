import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useCreateBrandPromotionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBrandPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.all });
    },
  });
};
