import {
  getAdminProductCategoryInfo,
  type ProductCategoryId,
} from "@shared/services/productCategory";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productCategoryQueryKeys } from "./queryKeys";

type AdminProductCategoryQueryResponse = Awaited<
  ReturnType<typeof getAdminProductCategoryInfo>
>;

type AdminProductCategoryQueryOptions = Omit<
  UseQueryOptions<
    AdminProductCategoryQueryResponse,
    unknown,
    AdminProductCategoryQueryResponse,
    ReturnType<typeof productCategoryQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductCategoryQuery = (
  productCategoryId: ProductCategoryId | number,
  options?: AdminProductCategoryQueryOptions,
) =>
  useQuery({
    queryKey: productCategoryQueryKeys.detail(productCategoryId),
    queryFn: () => getAdminProductCategoryInfo(productCategoryId),
    ...options,
    enabled: options?.enabled ?? Boolean(productCategoryId),
  });
