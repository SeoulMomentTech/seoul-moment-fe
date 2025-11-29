import {
  createHomeBanner,
  type CreateHomeBannerRequest,
} from "@shared/services/banner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { HOME_BANNER_QUERY_KEY } from "./queryKeys";

type CreateHomeBannerResponse = Awaited<ReturnType<typeof createHomeBanner>>;

type CreateHomeBannerOptions = Omit<
  UseMutationOptions<
    CreateHomeBannerResponse,
    unknown,
    CreateHomeBannerRequest
  >,
  "mutationFn"
>;

export const useCreateHomeBannerMutation = (
  options?: CreateHomeBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHomeBanner,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: HOME_BANNER_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
