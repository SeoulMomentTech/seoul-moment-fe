import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  updateAdminNewsHashtag,
  type AdminNewsHashtagId,
  type UpdateAdminNewsHashtagRequest,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_HASHTAG_QUERY_KEY, newsHashtagQueryKeys } from "./queryKeys";

type UpdateAdminNewsHashtagResponse = Awaited<
  ReturnType<typeof updateAdminNewsHashtag>
>;

interface UpdateAdminNewsHashtagVariables {
  hashtagId: AdminNewsHashtagId;
  payload: UpdateAdminNewsHashtagRequest;
}

type UpdateAdminNewsHashtagOptions = Omit<
  UseMutationOptions<
    UpdateAdminNewsHashtagResponse,
    unknown,
    UpdateAdminNewsHashtagVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminNewsHashtagMutation = (
  options?: UpdateAdminNewsHashtagOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ hashtagId, payload }) =>
      updateAdminNewsHashtag(hashtagId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: NEWS_HASHTAG_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: newsHashtagQueryKeys.detail(variables.hashtagId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
