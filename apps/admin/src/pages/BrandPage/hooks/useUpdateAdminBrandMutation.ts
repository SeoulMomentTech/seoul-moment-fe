import {
  updateAdminBrand,
  type BrandId,
  type UpdateAdminBrandRequest,
} from "@shared/services/brand";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY, brandQueryKeys } from "./queryKeys";

type UpdateAdminBrandResponse = Awaited<ReturnType<typeof updateAdminBrand>>;

interface UpdateAdminBrandVariables {
  brandId: BrandId;
  payload: UpdateAdminBrandRequest;
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
