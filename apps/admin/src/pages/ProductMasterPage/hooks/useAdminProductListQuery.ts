import {
  type GetAdminProductListParams,
  getAdminProductList,
} from "@shared/services/adminProduct";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { adminProductQueryKeys } from "./queryKeys";

type AdminProductListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductList>
>;

type AdminProductListQueryOptions = Omit<
  UseQueryOptions<
    AdminProductListQueryResponse,
    unknown,
    AdminProductListQueryResponse,
    ReturnType<typeof adminProductQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductListQuery = (
  params: GetAdminProductListParams,
  options?: AdminProductListQueryOptions,
) => {
  return useQuery({
    queryKey: adminProductQueryKeys.list(params),
    queryFn: () => getAdminProductList(params),
    ...options,
  });
};