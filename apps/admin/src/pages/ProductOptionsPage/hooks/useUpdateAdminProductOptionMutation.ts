import {
  updateAdminProductOption,
  type ProductOptionId,
  type UpdateAdminProductOptionRequest,
} from "@shared/services/productOption";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type UpdateAdminProductOptionResponse = Awaited<
  ReturnType<typeof updateAdminProductOption>
>;

interface UpdateAdminProductOptionVariables {
  optionId: ProductOptionId;
  payload: UpdateAdminProductOptionRequest;
}

type UpdateAdminProductOptionOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductOptionResponse,
    unknown,
    UpdateAdminProductOptionVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminProductOptionMutation = (
  options?: UpdateAdminProductOptionOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId, payload }) =>
      updateAdminProductOption(optionId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productOptionQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: productOptionQueryKeys.detail(variables.optionId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
