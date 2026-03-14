import * as api from "@shared/services/brandPromotion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

export const useCreateBrandPromotionSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBrandPromotionSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.sections.all });
    },
  });
};
