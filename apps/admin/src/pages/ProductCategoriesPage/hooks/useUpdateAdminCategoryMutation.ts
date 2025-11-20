import {
  updateAdminCategory,
  type CategoryId,
  type UpdateAdminCategoryRequest,
} from "@shared/services/category";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { CATEGORY_QUERY_KEY, categoryQueryKeys } from "./queryKeys";

type UpdateAdminCategoryResponse = Awaited<
  ReturnType<typeof updateAdminCategory>
>;

interface UpdateAdminCategoryVariables {
  categoryId: CategoryId;
  payload: UpdateAdminCategoryRequest;
}

type UpdateAdminCategoryOptions = Omit<
  UseMutationOptions<
    UpdateAdminCategoryResponse,
    unknown,
    UpdateAdminCategoryVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminCategoryMutation = (
  options?: UpdateAdminCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }) =>
      updateAdminCategory(categoryId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.detail(variables.categoryId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
