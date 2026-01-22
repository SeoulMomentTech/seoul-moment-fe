import {
  createAdminProductItem,
  type CreateAdminProductItemRequest,
} from "@shared/services/products";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productQueryKeys } from "./queryKeys";

type CreateAdminProductItemResponse = Awaited<
  ReturnType<typeof createAdminProductItem>
>;

type CreateAdminProductItemOptions = Omit<
  UseMutationOptions<
    CreateAdminProductItemResponse,
    unknown,
    CreateAdminProductItemRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductItemMutation = (
  options?: CreateAdminProductItemOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminProductItem,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
