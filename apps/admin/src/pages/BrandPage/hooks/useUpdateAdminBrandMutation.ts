import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  updateAdminBrand,
  type BrandId,
  type V1UpdateAdminBrandRequest,
} from "@shared/services/brand";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY, brandQueryKeys } from "../hooks/queryKeys";

type UpdateAdminBrandResponse = Awaited<ReturnType<typeof updateAdminBrand>>;

interface UpdateAdminBrandVariables {
  brandId: BrandId;
  payload: V1UpdateAdminBrandRequest;
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

  return useAppMutation({
    mutationFn: ({ brandId, payload }) => updateAdminBrand(brandId, payload),
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
