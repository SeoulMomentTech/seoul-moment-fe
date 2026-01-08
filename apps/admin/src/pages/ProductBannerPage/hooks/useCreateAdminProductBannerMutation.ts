import {
  createAdminProductBanner,
  type CreateAdminProductBannerRequest,
} from "@shared/services/productBanner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { PRODUCT_BANNER_QUERY_KEY } from "./queryKeys";

type CreateAdminProductBannerResponse = Awaited<
  ReturnType<typeof createAdminProductBanner>
>;

type CreateAdminProductBannerOptions = Omit<
  UseMutationOptions<
    CreateAdminProductBannerResponse,
    unknown,
    CreateAdminProductBannerRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductBannerMutation = (
  options?: CreateAdminProductBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminProductBanner,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_BANNER_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
