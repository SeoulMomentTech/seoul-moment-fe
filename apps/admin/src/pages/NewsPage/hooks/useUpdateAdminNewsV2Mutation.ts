import {
  updateAdminNewsV2,
  type AdminNewsId,
  type UpdateAdminNewsRequest,
} from "@shared/services/news";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY, newsQueryKeys } from "./queryKeys";

type UpdateAdminNewsV2Response = Awaited<ReturnType<typeof updateAdminNewsV2>>;

interface UpdateAdminNewsV2Variables {
  newsId: AdminNewsId;
  payload: UpdateAdminNewsRequest;
}

type UpdateAdminNewsV2Options = Omit<
  UseMutationOptions<
    UpdateAdminNewsV2Response,
    unknown,
    UpdateAdminNewsV2Variables
  >,
  "mutationFn"
>;

export const useUpdateAdminNewsV2Mutation = (
  options?: UpdateAdminNewsV2Options,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newsId, payload }) => updateAdminNewsV2(newsId, payload),
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
