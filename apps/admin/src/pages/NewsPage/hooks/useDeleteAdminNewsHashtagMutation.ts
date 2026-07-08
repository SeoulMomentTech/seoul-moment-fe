import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  deleteAdminNewsHashtag,
  type AdminNewsHashtagId,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_HASHTAG_QUERY_KEY, newsHashtagQueryKeys } from "./queryKeys";

type DeleteAdminNewsHashtagResponse = Awaited<
  ReturnType<typeof deleteAdminNewsHashtag>
>;

type DeleteAdminNewsHashtagOptions = Omit<
  UseMutationOptions<
    DeleteAdminNewsHashtagResponse,
    unknown,
    AdminNewsHashtagId
  >,
  "mutationFn"
>;

export const useDeleteAdminNewsHashtagMutation = (
  options?: DeleteAdminNewsHashtagOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (hashtagId) => deleteAdminNewsHashtag(hashtagId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: NEWS_HASHTAG_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: newsHashtagQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
