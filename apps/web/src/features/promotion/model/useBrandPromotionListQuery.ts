import { useAppQuery } from "@shared/lib/hooks";
import type { GetBrandPromotionBrandListResponse } from "@shared/services/brandPromotion";
import { getBrandPromotionListById } from "@shared/services/brandPromotion";

import type { CommonRes } from "@shared/services";
import { useSuspenseQuery, type UseQueryOptions } from "@tanstack/react-query";

interface UseBrandPromotionListQueryProps<T> {
  id: number;
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
}

export const useBrandPromotionListQuery = ({
  id,
  options,
}: UseBrandPromotionListQueryProps<
  CommonRes<GetBrandPromotionBrandListResponse>
>) => {
  return useAppQuery({
    ...options,
    queryKey: ["brandPromotionList", id],
    queryFn: () => getBrandPromotionListById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
};

export const useSuspenseBrandPromotionListQuery = ({
  id,
  options,
}: UseBrandPromotionListQueryProps<
  CommonRes<GetBrandPromotionBrandListResponse>
>) => {
  return useSuspenseQuery({
    ...options,
    queryKey: ["brandPromotionList"],
    queryFn: () => getBrandPromotionListById(id),
    select: (res) => res.data,
  });
};
