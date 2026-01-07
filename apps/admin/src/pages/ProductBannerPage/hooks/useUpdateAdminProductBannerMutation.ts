import {
  updateAdminProductBanner,
  type ProductBannerId,
  type UpdateAdminProductBannerRequest,
} from "@shared/services/productBanner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { PRODUCT_BANNER_QUERY_KEY, productBannerQueryKeys } from "./queryKeys";

type UpdateAdminProductBannerResponse = Awaited<
  ReturnType<typeof updateAdminProductBanner>
>;

interface UpdateAdminProductBannerParams {
  productBannerId: ProductBannerId;
  payload: UpdateAdminProductBannerRequest;
}

type UpdateAdminProductBannerOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductBannerResponse,
    unknown,
    UpdateAdminProductBannerParams
  >,
  "mutationFn"
>;

export const useUpdateAdminProductBannerMutation = (
  options?: UpdateAdminProductBannerOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productBannerId, payload }) =>
      updateAdminProductBanner(productBannerId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_BANNER_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: productBannerQueryKeys.detail(variables.productBannerId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
