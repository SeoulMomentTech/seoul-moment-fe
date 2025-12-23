import { deleteAdminBrand } from "@shared/services/brand";
import { type BrandId } from "@shared/services/brand";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY, brandQueryKeys } from "../hooks/queryKeys";

type DeleteAdminBrandResponse = Awaited<ReturnType<typeof deleteAdminBrand>>;

interface DeleteAdminBrandVariables {
  brandId: BrandId;
}

type UpdateAdminBrandOptions = Omit<
  UseMutationOptions<
    DeleteAdminBrandResponse,
    unknown,
    DeleteAdminBrandVariables
  >,
  "mutationFn"
>;

export const useDeleteAdminBrandMutation = (
  options?: UpdateAdminBrandOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId }) => deleteAdminBrand(brandId),
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
