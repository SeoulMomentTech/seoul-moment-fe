import {
  createAdminCategory,
  type CreateAdminCategoryRequest,
} from "@shared/services/category";

import {
  useMutation,
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
    CreateAdminCategoryRequest
  >,
  "mutationFn"
>;

export const useCreateAdminCategoryMutation = (
  options?: CreateAdminCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCategory,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
