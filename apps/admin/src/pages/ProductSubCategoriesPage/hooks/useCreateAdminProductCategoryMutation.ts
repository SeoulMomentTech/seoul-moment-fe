import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  createAdminProductCategory,
  type CreateAdminProductCategoryRequest,
} from "@shared/services/productCategory";

import {
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { PRODUCT_CATEGORY_QUERY_KEY } from "./queryKeys";

type CreateAdminProductCategoryResponse = Awaited<
  ReturnType<typeof createAdminProductCategory>
>;

type CreateAdminProductCategoryOptions = Omit<
  UseMutationOptions<
    CreateAdminProductCategoryResponse,
    unknown,
    CreateAdminProductCategoryRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductCategoryMutation = (
  options?: CreateAdminProductCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: createAdminProductCategory,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
