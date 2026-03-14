import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useDeleteBrandPromotionSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBrandPromotionSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.sections.all });
    },
  });
};
