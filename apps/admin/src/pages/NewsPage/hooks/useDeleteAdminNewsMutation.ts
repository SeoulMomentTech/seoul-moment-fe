import {
  deleteAdminNews,
  type AdminNewsId,
} from "@shared/services/news";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY, newsQueryKeys } from "./queryKeys";

type DeleteAdminNewsResponse = Awaited<ReturnType<typeof deleteAdminNews>>;

type DeleteAdminNewsOptions = Omit<
  UseMutationOptions<DeleteAdminNewsResponse, unknown, AdminNewsId>,
  "mutationFn"
>;

export const useDeleteAdminNewsMutation = (
  options?: DeleteAdminNewsOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsId) => deleteAdminNews(newsId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: newsQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
