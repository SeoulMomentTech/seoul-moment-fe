import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  updateAdminNewsV1,
  type AdminNewsId,
  type UpdateAdminNewsRequestV1,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY, newsQueryKeys } from "./queryKeys";

type UpdateAdminNewsV1Response = Awaited<
  ReturnType<typeof updateAdminNewsV1>
>;

interface UpdateAdminNewsV1Variables {
  newsId: AdminNewsId;
  payload: UpdateAdminNewsRequestV1;
}

type UpdateAdminNewsV1Options = Omit<
  UseMutationOptions<
    UpdateAdminNewsV1Response,
    unknown,
    UpdateAdminNewsV1Variables
  >,
  "mutationFn"
>;

export const useUpdateAdminNewsV1Mutation = (
  options?: UpdateAdminNewsV1Options,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ newsId, payload }) => updateAdminNewsV1(newsId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: newsQueryKeys.detailV1(variables.newsId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
