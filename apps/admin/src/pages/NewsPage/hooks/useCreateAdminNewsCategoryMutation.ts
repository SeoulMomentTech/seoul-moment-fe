import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminNewsCategory,
  type CreateAdminNewsCategoryRequest,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_CATEGORY_QUERY_KEY } from "./queryKeys";

type CreateAdminNewsCategoryResponse = Awaited<
  ReturnType<typeof createAdminNewsCategory>
>;

type CreateAdminNewsCategoryOptions = Omit<
  UseMutationOptions<
    CreateAdminNewsCategoryResponse,
    unknown,
    CreateAdminNewsCategoryRequest
  >,
  "mutationFn"
>;

export const useCreateAdminNewsCategoryMutation = (
  options?: CreateAdminNewsCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload) => createAdminNewsCategory(payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: NEWS_CATEGORY_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
