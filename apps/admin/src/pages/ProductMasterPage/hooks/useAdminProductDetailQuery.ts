import { getAdminProductDetail } from "@shared/services/adminProduct";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { adminProductQueryKeys } from "./queryKeys";

type AdminProductDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductDetail>
>;

type AdminProductDetailQueryOptions = Omit<
  UseQueryOptions<
    AdminProductDetailQueryResponse,
    unknown,
    AdminProductDetailQueryResponse,
    ReturnType<typeof adminProductQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductDetailQuery = (
  id: number,
  options?: AdminProductDetailQueryOptions,
) => {
  return useQuery({
    queryKey: adminProductQueryKeys.detail(id),
    queryFn: () => getAdminProductDetail(id),
    enabled: !!id,
    ...options,
  });
};