import {
  type PostAdminProductRequest,
  postAdminProduct,
} from "@shared/services/adminProduct";

import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

type CreateAdminProductResponse = Awaited<ReturnType<typeof postAdminProduct>>;

type CreateAdminProductOptions = Omit<
  UseMutationOptions<
    CreateAdminProductResponse,
    unknown,
    PostAdminProductRequest
  >,
  "mutationFn"
>;

export const useCreateAdminProductMutation = (
  options?: CreateAdminProductOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PostAdminProductRequest) => postAdminProduct(payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCT_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};