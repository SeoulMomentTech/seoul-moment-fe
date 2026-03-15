import { useAppQuery } from "@shared/lib/hooks";
import type { GetBrandPromotionBrandListResponse } from "@shared/services/brandPromotion";
import { getBrandPromotionList } from "@shared/services/brandPromotion";

import type { CommonRes } from "@shared/services";
import { useSuspenseQuery, type UseQueryOptions } from "@tanstack/react-query";

interface UseBrandPromotionListQueryProps<T> {
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
}

export const useBrandPromotionListQuery = ({
  options,
}: UseBrandPromotionListQueryProps<
  CommonRes<GetBrandPromotionBrandListResponse>
> = {}) => {
  return useAppQuery({
    ...options,
    queryKey: ["brandPromotionList"],
    queryFn: () => getBrandPromotionList(),
    select: (res) => res.data,
  });
};

export const useSuspenseBrandPromotionListQuery = ({
  options,
}: UseBrandPromotionListQueryProps<
  CommonRes<GetBrandPromotionBrandListResponse>
> = {}) => {
  return useSuspenseQuery({
    ...options,
    queryKey: ["brandPromotionList"],
    queryFn: () => getBrandPromotionList(),
    select: (res) => res.data,
  });
};
