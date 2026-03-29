import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminNews,
  type CreateAdminNewsRequest,
} from "@shared/services/news";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { NEWS_QUERY_KEY } from "./queryKeys";

type CreateAdminNewsResponse = Awaited<ReturnType<typeof createAdminNews>>;

type CreateAdminNewsOptions = Omit<
  UseMutationOptions<CreateAdminNewsResponse, unknown, CreateAdminNewsRequest>,
  "mutationFn"
>;

export const useCreateAdminNewsMutation = (
  options?: CreateAdminNewsOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminNews,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
