import {
  createAdminBrand,
  type CreateAdminBrandRequest,
} from "@shared/services/brand";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { BRAND_QUERY_KEY } from "./queryKeys";

type CreateAdminBrandResponse = Awaited<ReturnType<typeof createAdminBrand>>;

type CreateAdminBrandOptions = Omit<
  UseMutationOptions<
    CreateAdminBrandResponse,
    unknown,
    CreateAdminBrandRequest
  >,
  "mutationFn"
>;

export const useCreateAdminBrandMutation = (
  options?: CreateAdminBrandOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminBrand,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
