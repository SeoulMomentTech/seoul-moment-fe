import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const usePatchBrandPromotionPopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof api.patchBrandPromotionPopup>[1] }) =>
      api.patchBrandPromotionPopup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.popups.all });
    },
  });
};
