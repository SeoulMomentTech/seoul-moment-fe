import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  type GetAdminProductListParams,
  getAdminProductList,
} from "@shared/services/adminProduct";


import { adminProductQueryKeys } from "./queryKeys";

type AdminProductListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductList>
>;

type AdminProductListQueryOptions = Omit<
  UseAppQueryOptions<
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
  return useAppQuery({
    queryKey: adminProductQueryKeys.list(params),
    queryFn: () => getAdminProductList(params),
    ...options,
  });
};