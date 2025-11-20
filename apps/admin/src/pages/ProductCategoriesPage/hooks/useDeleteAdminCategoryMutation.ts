import {
  deleteAdminCategory,
  type CategoryId,
} from "@shared/services/category";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { CATEGORY_QUERY_KEY, categoryQueryKeys } from "./queryKeys";

type DeleteAdminCategoryResponse = Awaited<
  ReturnType<typeof deleteAdminCategory>
>;

type DeleteAdminCategoryOptions = Omit<
  UseMutationOptions<DeleteAdminCategoryResponse, unknown, CategoryId>,
  "mutationFn"
>;

export const useDeleteAdminCategoryMutation = (
  options?: DeleteAdminCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => deleteAdminCategory(categoryId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
