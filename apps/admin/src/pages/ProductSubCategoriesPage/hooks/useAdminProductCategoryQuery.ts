import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductCategoryInfo,
  type ProductCategoryId,
} from "@shared/services/productCategory";


import { productCategoryQueryKeys } from "./queryKeys";

type AdminProductCategoryQueryResponse = Awaited<
  ReturnType<typeof getAdminProductCategoryInfo>
>;

type AdminProductCategoryQueryOptions = Omit<
  UseAppQueryOptions<
    AdminProductCategoryQueryResponse,
    unknown,
    AdminProductCategoryQueryResponse,
    ReturnType<typeof productCategoryQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductCategoryQuery = (
  productCategoryId: ProductCategoryId,
  options?: AdminProductCategoryQueryOptions,
) =>
  useAppQuery({
    queryKey: productCategoryQueryKeys.detail(productCategoryId),
    queryFn: () => getAdminProductCategoryInfo(productCategoryId),
    ...options,
    enabled: options?.enabled ?? Boolean(productCategoryId),
  });
