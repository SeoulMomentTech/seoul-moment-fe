import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductItemDetail,
  type AdminProductItemId,
} from "@shared/services/products";


import { productQueryKeys } from "./queryKeys";

type AdminProductItemDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductItemDetail>
>;

type AdminProductItemDetailQueryOptions = Omit<
  UseAppQueryOptions<
    AdminProductItemDetailQueryResponse,
    unknown,
    AdminProductItemDetailQueryResponse,
    ReturnType<typeof productQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductItemDetailQuery = (
  productItemId: AdminProductItemId | number,
  options?: AdminProductItemDetailQueryOptions,
) =>
  useAppQuery({
    queryKey: productQueryKeys.detail(productItemId),
    queryFn: () => getAdminProductItemDetail(productItemId as AdminProductItemId),
    enabled: Boolean(productItemId),
    ...options,
  });
