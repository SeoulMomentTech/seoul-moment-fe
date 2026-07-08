import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  deleteAdminNewsCategory,
  type AdminNewsCategoryId,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_CATEGORY_QUERY_KEY, newsCategoryQueryKeys } from "./queryKeys";

type DeleteAdminNewsCategoryResponse = Awaited<
  ReturnType<typeof deleteAdminNewsCategory>
>;

type DeleteAdminNewsCategoryOptions = Omit<
  UseMutationOptions<
    DeleteAdminNewsCategoryResponse,
    unknown,
    AdminNewsCategoryId
  >,
  "mutationFn"
>;

export const useDeleteAdminNewsCategoryMutation = (
  options?: DeleteAdminNewsCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (categoryId) => deleteAdminNewsCategory(categoryId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: NEWS_CATEGORY_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: newsCategoryQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
