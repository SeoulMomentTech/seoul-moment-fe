import {
  getAdminProductItemList,
  type AdminProductItemListParams,
} from "@shared/services/products";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productQueryKeys } from "./queryKeys";

type AdminProductItemListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductItemList>
>;

type AdminProductItemListQueryOptions = Omit<
  UseQueryOptions<
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
  useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getAdminProductItemList(params),
    ...options,
  });
