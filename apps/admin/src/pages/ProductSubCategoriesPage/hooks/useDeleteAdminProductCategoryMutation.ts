import {
  deleteAdminProductCategory,
  type ProductCategoryId,
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

type DeleteAdminProductCategoryResponse = Awaited<
  ReturnType<typeof deleteAdminProductCategory>
>;

type DeleteAdminProductCategoryOptions = Omit<
  UseMutationOptions<
    DeleteAdminProductCategoryResponse,
    unknown,
    ProductCategoryId
  >,
  "mutationFn"
>;

export const useDeleteAdminProductCategoryMutation = (
  options?: DeleteAdminProductCategoryOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productCategoryId) =>
      deleteAdminProductCategory(productCategoryId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: productCategoryQueryKeys.detail(variables),
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
