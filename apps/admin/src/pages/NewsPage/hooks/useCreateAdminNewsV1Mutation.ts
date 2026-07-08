import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminNewsV1,
  type CreateAdminNewsRequestV1,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY } from "./queryKeys";

type CreateAdminNewsV1Response = Awaited<
  ReturnType<typeof createAdminNewsV1>
>;

type CreateAdminNewsV1Options = Omit<
  UseMutationOptions<
    CreateAdminNewsV1Response,
    unknown,
    CreateAdminNewsRequestV1
  >,
  "mutationFn"
>;

export const useCreateAdminNewsV1Mutation = (
  options?: CreateAdminNewsV1Options,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminNewsV1,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
