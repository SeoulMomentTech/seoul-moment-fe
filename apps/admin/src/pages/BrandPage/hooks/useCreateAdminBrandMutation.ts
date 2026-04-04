import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminBrand,
  type V1CreateAdminBrandRequest,
} from "@shared/services/brand";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY } from "../../BrandPage/hooks/queryKeys";

type CreateAdminBrandResponse = Awaited<ReturnType<typeof createAdminBrand>>;

type CreateAdminBrandOptions = Omit<
  UseMutationOptions<
    CreateAdminBrandResponse,
    unknown,
    V1CreateAdminBrandRequest
  >,
  "mutationFn"
>;

export const useCreateAdminBrandMutation = (
  options?: CreateAdminBrandOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminBrand,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
