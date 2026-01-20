import {
  updateAdminProductItem,
  type AdminProductItemId,
  type UpdateAdminProductItemRequest,
} from "@shared/services/products";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productQueryKeys } from "./queryKeys";

type UpdateAdminProductItemResponse = Awaited<
  ReturnType<typeof updateAdminProductItem>
>;

interface UpdateAdminProductItemParams {
  productItemId: AdminProductItemId;
  payload: UpdateAdminProductItemRequest;
}

type UpdateAdminProductItemOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductItemResponse,
    unknown,
    UpdateAdminProductItemParams
  >,
  "mutationFn"
>;

export const useUpdateAdminProductItemMutation = (
  options?: UpdateAdminProductItemOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productItemId, payload }) =>
      updateAdminProductItem(productItemId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(variables.productItemId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
