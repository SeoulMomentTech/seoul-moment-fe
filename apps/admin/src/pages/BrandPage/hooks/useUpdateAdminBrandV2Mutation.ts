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

import { BRAND_QUERY_KEY, brandQueryKeys } from "./queryKeys";

type UpdateAdminBrandV2Response = Awaited<
  ReturnType<typeof updateAdminBrandV2>
>;

interface UpdateAdminBrandV2Variables {
  brandId: BrandId;
  payload: V2UpdateAdminBrandRequest;
}

type UpdateAdminBrandV2Options = Omit<
  UseMutationOptions<
    UpdateAdminBrandV2Response,
    unknown,
    UpdateAdminBrandV2Variables
  >,
  "mutationFn"
>;

export const useUpdateAdminBrandV2Mutation = (
  options?: UpdateAdminBrandV2Options,
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
