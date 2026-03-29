import { useAppMutation } from "@shared/hooks/useAppMutation";
import {
  type PatchAdminProductRequest,
  patchAdminProduct,
} from "@shared/services/adminProduct";

import {
  type UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

import { ADMIN_PRODUCT_QUERY_KEY } from "./queryKeys";

type UpdateAdminProductResponse = Awaited<ReturnType<typeof patchAdminProduct>>;

interface UpdateAdminProductVariables {
  id: number;
  payload: PatchAdminProductRequest;
}

type UpdateAdminProductOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductResponse,
    unknown,
    UpdateAdminProductVariables
  >,
  "mutationFn"
>;

export const useUpdateAdminProductMutation = (
  options?: UpdateAdminProductOptions,
) => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PatchAdminProductRequest;
    }) => patchAdminProduct(id, payload),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCT_QUERY_KEY,
      });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};