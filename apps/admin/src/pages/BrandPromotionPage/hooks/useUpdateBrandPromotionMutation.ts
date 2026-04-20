import { useAppMutation } from "@shared/hooks/useAppMutation";
import * as api from "@shared/services/brandPromotion";
import type { PatchAdminBrandPromotionRequest } from "@shared/services/brandPromotion";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { brandPromotionQueryKeys } from "./queryKeys";

type UpdateBrandPromotionResponse = Awaited<
  ReturnType<typeof api.updateBrandPromotion>
>;

interface UpdateBrandPromotionVariables {
  id: number;
  payload: PatchAdminBrandPromotionRequest;
}

type UpdateBrandPromotionOptions = Omit<
  UseMutationOptions<
    UpdateBrandPromotionResponse,
    unknown,
    UpdateBrandPromotionVariables
  >,
  "mutationFn"
>;

export const useUpdateBrandPromotionMutation = (
  options?: UpdateBrandPromotionOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ id, payload }) => api.updateBrandPromotion(id, payload),
    toastOnError: "브랜드 프로모션 수정에 실패했습니다.",
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: brandPromotionQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: brandPromotionQueryKeys.detail(variables.id),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
