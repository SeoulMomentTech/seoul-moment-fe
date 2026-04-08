import { useAppMutation } from "@shared/hooks/useAppMutation";
import { createAdminCategory } from "@shared/services/category";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { CATEGORY_QUERY_KEY } from "./queryKeys";

type CreateAdminCategoryResponse = Awaited<
  ReturnType<typeof createAdminCategory>
>;

type CreateAdminCategoryOptions = Omit<
  UseMutationOptions<
    CreateAdminCategoryResponse,
    unknown,
    { name: string }
  >,
  "mutationFn"
>;

export const useCreateAdminCategoryMutation = (
  options?: CreateAdminCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminCategory,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
