import { useAppMutation } from "@shared/hooks/useAppMutation";
import * as api from "@shared/services/brandPromotion";

import { useQueryClient } from "@tanstack/react-query";


import { brandPromotionQueryKeys } from "./queryKeys";

export const useCreateBrandPromotionMutation = () => {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: api.createBrandPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandPromotionQueryKeys.all });
    },
  });
};
