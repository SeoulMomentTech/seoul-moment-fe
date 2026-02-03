import {
  updateAdminBrandV2,
  type BrandId,
  type V2UpdateAdminBrandRequest,
} from "@shared/services/brand";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY, brandQueryKeys } from "../hooks/queryKeys";

type UpdateAdminBrandResponse = Awaited<ReturnType<typeof updateAdminBrandV2>>;

interface UpdateAdminBrandVariables {
  brandId: BrandId;
  payload: V2UpdateAdminBrandRequest;
}

type UpdateAdminBrandOptions = Omit<
  UseMutationOptions<
    UpdateAdminBrandResponse,
    unknown,
    UpdateAdminBrandVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminBrandMutation = (
  options?: UpdateAdminBrandOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId, payload }) => updateAdminBrandV2(brandId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: brandQueryKeys.detail(variables.brandId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
