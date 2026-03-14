import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useUpdateBrandPromotionNoticsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof api.updateBrandPromotionNotics>[1] }) =>
      api.updateBrandPromotionNotics(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.notics.all });
    },
  });
};
