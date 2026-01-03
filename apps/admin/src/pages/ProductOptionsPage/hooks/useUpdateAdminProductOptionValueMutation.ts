import {
  updateAdminProductOptionValue,
  type ProductOptionId,
  type ProductOptionValueId,
  type UpdateAdminProductOptionValueRequest,
} from "@shared/services/productOption";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type UpdateAdminProductOptionValueResponse = Awaited<
  ReturnType<typeof updateAdminProductOptionValue>
>;

interface UpdateAdminProductOptionValueVariables {
  optionValueId: ProductOptionValueId;
  payload: UpdateAdminProductOptionValueRequest;
  optionId?: ProductOptionId;
}

type UpdateAdminProductOptionValueOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductOptionValueResponse,
    unknown,
    UpdateAdminProductOptionValueVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminProductOptionValueMutation = (
  options?: UpdateAdminProductOptionValueOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionValueId, payload }) =>
      updateAdminProductOptionValue(optionValueId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productOptionQueryKeys.all,
      });
      if (variables.optionId) {
        await queryClient.invalidateQueries({
          queryKey: productOptionQueryKeys.detail(variables.optionId),
        });
      }
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
