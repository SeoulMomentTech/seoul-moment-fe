import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminProductDetail } from "@shared/services/adminProduct";


import { adminProductQueryKeys } from "./queryKeys";

type AdminProductDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductDetail>
>;

type AdminProductDetailQueryOptions = Omit<
  UseAppQueryOptions<
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
    ...options,
  });
};