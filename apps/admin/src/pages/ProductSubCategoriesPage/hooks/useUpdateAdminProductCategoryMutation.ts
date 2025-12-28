import {
  updateAdminProductCategory,
  type ProductCategoryId,
  type UpdateAdminProductCategoryRequest,
} from "@shared/services/productCategory";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import {
  PRODUCT_CATEGORY_QUERY_KEY,
  productCategoryQueryKeys,
} from "./queryKeys";

type UpdateAdminProductCategoryResponse = Awaited<
  ReturnType<typeof updateAdminProductCategory>
>;

interface UpdateAdminProductCategoryVariables {
  productCategoryId: ProductCategoryId;
  payload: UpdateAdminProductCategoryRequest;
}

type UpdateAdminProductCategoryOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductCategoryResponse,
    unknown,
    UpdateAdminProductCategoryVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminProductCategoryMutation = (
  options?: UpdateAdminProductCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productCategoryId, payload }) =>
      updateAdminProductCategory(productCategoryId, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: productCategoryQueryKeys.detail(variables.productCategoryId),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
