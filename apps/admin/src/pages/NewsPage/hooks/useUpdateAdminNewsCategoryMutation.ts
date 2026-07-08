import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  updateAdminNewsCategory,
  type AdminNewsCategoryId,
  type UpdateAdminNewsCategoryRequest,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_CATEGORY_QUERY_KEY, newsCategoryQueryKeys } from "./queryKeys";

type UpdateAdminNewsCategoryResponse = Awaited<
  ReturnType<typeof updateAdminNewsCategory>
>;

interface UpdateAdminNewsCategoryVariables {
  categoryId: AdminNewsCategoryId;
  payload: UpdateAdminNewsCategoryRequest;
}

type UpdateAdminNewsCategoryOptions = Omit<
  UseMutationOptions<
    UpdateAdminNewsCategoryResponse,
    unknown,
    UpdateAdminNewsCategoryVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminNewsCategoryMutation = (
  options?: UpdateAdminNewsCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ categoryId, payload }) =>
      updateAdminNewsCategory(categoryId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: NEWS_CATEGORY_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: newsCategoryQueryKeys.detail(variables.categoryId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
