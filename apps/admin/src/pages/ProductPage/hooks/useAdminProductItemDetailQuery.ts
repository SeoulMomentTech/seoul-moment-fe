import {
  getAdminProductItemDetail,
  type AdminProductItemId,
} from "@shared/services/products";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productQueryKeys } from "./queryKeys";

type AdminProductItemDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductItemDetail>
>;

type AdminProductItemDetailQueryOptions = Omit<
  UseQueryOptions<
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
  useQuery({
    queryKey: productQueryKeys.detail(productItemId),
    queryFn: () => getAdminProductItemDetail(productItemId as AdminProductItemId),
    enabled: Boolean(productItemId),
    ...options,
  });
