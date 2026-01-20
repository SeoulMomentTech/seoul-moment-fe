import {
  deleteAdminProductItem,
  type AdminProductItemId,
} from "@shared/services/products";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productQueryKeys } from "./queryKeys";

type DeleteAdminProductItemResponse = Awaited<
  ReturnType<typeof deleteAdminProductItem>
>;

type DeleteAdminProductItemOptions = Omit<
  UseMutationOptions<
    DeleteAdminProductItemResponse,
    unknown,
    AdminProductItemId
  >,
  "mutationFn"
>;

export const useDeleteAdminProductItemMutation = (
  options?: DeleteAdminProductItemOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productItemId) => deleteAdminProductItem(productItemId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
