import {
  deleteAdminProductBanner,
  type ProductBannerId,
} from "@shared/services/productBanner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { PRODUCT_BANNER_QUERY_KEY } from "./queryKeys";

type DeleteAdminProductBannerResponse = Awaited<
  ReturnType<typeof deleteAdminProductBanner>
>;

type DeleteAdminProductBannerOptions = Omit<
  UseMutationOptions<DeleteAdminProductBannerResponse, unknown, ProductBannerId>,
  "mutationFn"
>;

export const useDeleteAdminProductBannerMutation = (
  options?: DeleteAdminProductBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId) => deleteAdminProductBanner(bannerId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_BANNER_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
