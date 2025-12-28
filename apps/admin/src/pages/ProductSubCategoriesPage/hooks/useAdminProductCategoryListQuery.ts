import {
  getAdminProductCategoryList,
  type AdminProductCategoryListParams,
} from "@shared/services/productCategory";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productCategoryQueryKeys } from "./queryKeys";

type AdminProductCategoryListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductCategoryList>
>;

type AdminProductCategoryListQueryOptions = Omit<
  UseQueryOptions<
    AdminProductCategoryListQueryResponse,
    unknown,
    AdminProductCategoryListQueryResponse,
    ReturnType<typeof productCategoryQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductCategoryListQuery = (
  params?: AdminProductCategoryListParams,
  options?: AdminProductCategoryListQueryOptions,
) =>
  useQuery({
    queryKey: productCategoryQueryKeys.list(params),
    queryFn: () => getAdminProductCategoryList(params),
    ...options,
  });
