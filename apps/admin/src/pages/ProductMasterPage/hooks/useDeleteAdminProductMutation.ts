import { deleteAdminProduct } from "@shared/services/adminProduct";

import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

type DeleteAdminProductResponse = Awaited<ReturnType<typeof deleteAdminProduct>>;

type DeleteAdminProductOptions = Omit<
  UseMutationOptions<DeleteAdminProductResponse, unknown, number>,
  "mutationFn"
>;

export const useDeleteAdminProductMutation = (
  options?: DeleteAdminProductOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCT_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};