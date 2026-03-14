import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useCreateBrandPromotionEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBrandPromotionEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.events.all });
    },
  });
};
