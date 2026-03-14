import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useCreateBrandPromotionPopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBrandPromotionPopup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.popups.all });
    },
  });
};
