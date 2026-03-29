import { useAppQuery } from "@shared/hooks/useAppQuery";
import { getAdminProductDetail } from "@shared/services/adminProduct";

import { type UseQueryOptions } from "@tanstack/react-query";

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
  return useAppQuery({
    queryKey: adminProductQueryKeys.detail(id),
    queryFn: () => getAdminProductDetail(id),
    enabled: !!id,
    ...options,
  });
};