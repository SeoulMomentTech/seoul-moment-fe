import {
  updateAdminNews,
  type AdminNewsId,
  type UpdateAdminNewsRequest,
} from "@shared/services/news";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY, newsQueryKeys } from "./queryKeys";

type UpdateAdminNewsResponse = Awaited<ReturnType<typeof updateAdminNews>>;

interface UpdateAdminNewsVariables {
  newsId: AdminNewsId;
  payload: UpdateAdminNewsRequest;
}

type UpdateAdminNewsOptions = Omit<
  UseMutationOptions<UpdateAdminNewsResponse, unknown, UpdateAdminNewsVariables>,
  "mutationFn"
>;

export const useUpdateAdminNewsMutation = (
  options?: UpdateAdminNewsOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newsId, payload }) => updateAdminNews(newsId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: newsQueryKeys.detail(variables.newsId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
