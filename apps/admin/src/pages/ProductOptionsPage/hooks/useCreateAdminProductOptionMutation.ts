import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminProductOption,
  type CreateAdminProductOptionRequest,
} from "@shared/services/productOption";

import {
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

  return useAppMutation({
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
