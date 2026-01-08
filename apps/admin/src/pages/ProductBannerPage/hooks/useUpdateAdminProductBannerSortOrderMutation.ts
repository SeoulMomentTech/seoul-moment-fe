import {
  updateAdminProductBannerSortOrder,
  type UpdateAdminProductBannerSortOrderRequest,
} from "@shared/services/productBanner";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { PRODUCT_BANNER_QUERY_KEY } from "./queryKeys";

type UpdateAdminProductBannerSortOrderResponse = Awaited<
  ReturnType<typeof updateAdminProductBannerSortOrder>
>;

type UpdateAdminProductBannerSortOrderOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductBannerSortOrderResponse,
    unknown,
    UpdateAdminProductBannerSortOrderRequest
  >,
  "mutationFn"
>;

export const useUpdateAdminProductBannerSortOrderMutation = (
  options?: UpdateAdminProductBannerSortOrderOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminProductBannerSortOrder,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_BANNER_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
