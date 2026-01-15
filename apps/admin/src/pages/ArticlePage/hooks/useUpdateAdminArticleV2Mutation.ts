import {
  updateAdminArticleV2,
  type AdminArticleId,
  type V2UpdateAdminArticleRequest,
} from "@shared/services/article";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { ARTICLE_QUERY_KEY, articleQueryKeys } from "./queryKeys";

type UpdateAdminArticleV2Response = Awaited<
  ReturnType<typeof updateAdminArticleV2>
>;

interface UpdateAdminArticleV2Variables {
  articleId: AdminArticleId;
  payload: V2UpdateAdminArticleRequest;
}

type UpdateAdminArticleV2Options = Omit<
  UseMutationOptions<
    UpdateAdminArticleV2Response,
    unknown,
    UpdateAdminArticleV2Variables
  >,
  "mutationFn"
>;

export const useUpdateAdminArticleV2Mutation = (
  options?: UpdateAdminArticleV2Options,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, payload }) =>
      updateAdminArticleV2(articleId, payload),
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
