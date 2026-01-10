import {
  createAdminArticle,
  type CreateAdminArticleRequest,
} from "@shared/services/article";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { ARTICLE_QUERY_KEY } from "./queryKeys";

type CreateAdminArticleResponse = Awaited<
  ReturnType<typeof createAdminArticle>
>;

type CreateAdminArticleOptions = Omit<
  UseMutationOptions<
    CreateAdminArticleResponse,
    unknown,
    CreateAdminArticleRequest
  >,
  "mutationFn"
>;

export const useCreateAdminArticleMutation = (
  options?: CreateAdminArticleOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminArticle,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ARTICLE_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
