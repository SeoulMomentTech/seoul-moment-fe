import {
  updateHomeBanner,
  type UpdateHomeBannerRequest,
} from "@shared/services/banner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { HOME_BANNER_QUERY_KEY, homeBannerQueryKeys } from "./queryKeys";

type UpdateHomeBannerResponse = Awaited<ReturnType<typeof updateHomeBanner>>;

type UpdateHomeBannerOptions = Omit<
  UseMutationOptions<
    UpdateHomeBannerResponse,
    unknown,
    UpdateHomeBannerRequest
  >,
  "mutationFn"
>;

export const useUpdateHomeBannerMutation = (
  options?: UpdateHomeBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHomeBanner,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: HOME_BANNER_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: homeBannerQueryKeys.detail(variables.bannerId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
