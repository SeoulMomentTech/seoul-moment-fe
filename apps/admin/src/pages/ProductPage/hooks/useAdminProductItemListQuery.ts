import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductItemList,
  type AdminProductItemListParams,
} from "@shared/services/products";


import { productQueryKeys } from "./queryKeys";

type AdminProductItemListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductItemList>
>;

type AdminProductItemListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminProductItemListQueryResponse,
    unknown,
    AdminProductItemListQueryResponse,
    ReturnType<typeof productQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductItemListQuery = (
  params?: AdminProductItemListParams,
  options?: AdminProductItemListQueryOptions,
) =>
  useAppQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getAdminProductItemList(params),
    ...options,
  });
