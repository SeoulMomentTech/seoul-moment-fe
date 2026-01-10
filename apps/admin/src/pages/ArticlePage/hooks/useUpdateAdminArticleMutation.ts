import {
  updateAdminArticle,
  type AdminArticleId,
  type UpdateAdminArticleRequest,
} from "@shared/services/article";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { ARTICLE_QUERY_KEY, articleQueryKeys } from "./queryKeys";

type UpdateAdminArticleResponse = Awaited<
  ReturnType<typeof updateAdminArticle>
>;

interface UpdateAdminArticleVariables {
  articleId: AdminArticleId;
  payload: UpdateAdminArticleRequest;
}

type UpdateAdminArticleOptions = Omit<
  UseMutationOptions<
    UpdateAdminArticleResponse,
    unknown,
    UpdateAdminArticleVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminArticleMutation = (
  options?: UpdateAdminArticleOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, payload }) =>
      updateAdminArticle(articleId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ARTICLE_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: articleQueryKeys.detail(variables.articleId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
