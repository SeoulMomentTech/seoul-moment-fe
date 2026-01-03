import {
  deleteAdminProductOptionValue,
  type ProductOptionId,
  type ProductOptionValueId,
} from "@shared/services/productOption";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type DeleteAdminProductOptionValueResponse = Awaited<
  ReturnType<typeof deleteAdminProductOptionValue>
>;

interface DeleteAdminProductOptionValueVariables {
  optionValueId: ProductOptionValueId;
  optionId: ProductOptionId;
}

type DeleteAdminProductOptionValueOptions = Omit<
  UseMutationOptions<
    DeleteAdminProductOptionValueResponse,
    unknown,
    DeleteAdminProductOptionValueVariables
  >,
  "mutationFn"
>;

export const useDeleteAdminProductOptionValueMutation = (
  options?: DeleteAdminProductOptionValueOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionValueId }) =>
      deleteAdminProductOptionValue(optionValueId),
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
