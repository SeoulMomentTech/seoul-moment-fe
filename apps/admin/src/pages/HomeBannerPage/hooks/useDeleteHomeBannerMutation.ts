import { deleteHomeBanner, type HomeBannerId } from "@shared/services/banner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { HOME_BANNER_QUERY_KEY, homeBannerQueryKeys } from "./queryKeys";

type DeleteHomeBannerResponse = Awaited<ReturnType<typeof deleteHomeBanner>>;

type DeleteHomeBannerOptions = Omit<
  UseMutationOptions<DeleteHomeBannerResponse, unknown, HomeBannerId>,
  "mutationFn"
>;

export const useDeleteHomeBannerMutation = (
  options?: DeleteHomeBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId) => deleteHomeBanner(bannerId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: HOME_BANNER_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: homeBannerQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
