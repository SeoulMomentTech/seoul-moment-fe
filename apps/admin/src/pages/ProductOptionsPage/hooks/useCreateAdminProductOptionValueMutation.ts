import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminProductOptionValue,
  type CreateAdminProductOptionValueRequest,
} from "@shared/services/productOption";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { productOptionQueryKeys } from "./queryKey";

type CreateAdminProductOptionValueResponse = Awaited<
  ReturnType<typeof createAdminProductOptionValue>
>;

type CreateAdminProductOptionValueOptions = Omit<
  UseMutationOptions<
    CreateAdminProductOptionValueResponse,
    unknown,
    CreateAdminProductOptionValueRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductOptionValueMutation = (
  options?: CreateAdminProductOptionValueOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminProductOptionValue,
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
