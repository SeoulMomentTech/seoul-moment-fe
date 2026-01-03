import {
  deleteAdminProductOption,
  type ProductOptionId,
} from "@shared/services/productOption";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type DeleteAdminProductOptionResponse = Awaited<
  ReturnType<typeof deleteAdminProductOption>
>;

type DeleteAdminProductOptionOptions = Omit<
  UseMutationOptions<
    DeleteAdminProductOptionResponse,
    unknown,
    ProductOptionId
  >,
  "mutationFn"
>;
export const useDeleteAdminProductOptionMutation = (
  options?: DeleteAdminProductOptionOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId: ProductOptionId) =>
      deleteAdminProductOption(optionId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: productOptionQueryKeys.all });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
