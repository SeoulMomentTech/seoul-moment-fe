import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useDeleteBrandPromotionPopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBrandPromotionPopup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.popups.all });
    },
  });
};
