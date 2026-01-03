import {
  createAdminProductOption,
  type CreateAdminProductOptionRequest,
} from "@shared/services/productOption";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type CreateAdminProductOptionResponse = Awaited<
  ReturnType<typeof createAdminProductOption>
>;

type CreateAdminProductOptionOptions = Omit<
  UseMutationOptions<
    CreateAdminProductOptionResponse,
    unknown,
    CreateAdminProductOptionRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductOptionMutation = (
  options?: CreateAdminProductOptionOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminProductOption,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: productOptionQueryKeys.all,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
