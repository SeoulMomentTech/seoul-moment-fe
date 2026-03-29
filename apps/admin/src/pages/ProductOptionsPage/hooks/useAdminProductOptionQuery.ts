import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductOptionDetail,
  type ProductOptionId,
} from "@shared/services/productOption";


import { productOptionQueryKeys } from "./queryKey";

type AdminProductOptionDetailResponse = Awaited<
  ReturnType<typeof getAdminProductOptionDetail>
>;

type AdminProductOptionDetailOptions = Omit<
  UseAppQueryOptions<
    AdminProductOptionDetailResponse,
    unknown,
    AdminProductOptionDetailResponse,
    ReturnType<typeof productOptionQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductOptionQuery = (
  optionId: ProductOptionId,
  options?: AdminProductOptionDetailOptions,
) => {
  return useAppQuery({
    queryFn: () => getAdminProductOptionDetail(optionId),
    queryKey: productOptionQueryKeys.detail(optionId),
    ...options,
    enabled: options?.enabled ?? Boolean(optionId),
    select: (res) => res.data,
  });
};
