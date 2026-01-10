import {
  deleteAdminArticle,
  type AdminArticleId,
} from "@shared/services/article";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { ARTICLE_QUERY_KEY, articleQueryKeys } from "./queryKeys";

type DeleteAdminArticleResponse = Awaited<
  ReturnType<typeof deleteAdminArticle>
>;

type DeleteAdminArticleOptions = Omit<
  UseMutationOptions<DeleteAdminArticleResponse, unknown, AdminArticleId>,
  "mutationFn"
>;

export const useDeleteAdminArticleMutation = (
  options?: DeleteAdminArticleOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId) => deleteAdminArticle(articleId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ARTICLE_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: articleQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
