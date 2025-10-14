import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { CommonRes } from "@shared/services";
import type {
  BrandDetailInfo,
  GetBrandDetailReq,
} from "@shared/services/brand";
import { getBrandDetail } from "@shared/services/brand";

interface UseBrandDetailProps<T> {
  options: Omit<UseQueryOptions<T>, "queryFn">;
  params: GetBrandDetailReq;
}

export const useBrandDetail = ({
  options,
  params,
}: UseBrandDetailProps<CommonRes<BrandDetailInfo>>) => {
  return useQuery({
    ...options,
    queryFn: () => getBrandDetail(params),
    select: (res) => res.data,
  });
};

export const useSuspenseBrandDetail = ({
  options,
  params,
}: UseBrandDetailProps<CommonRes<BrandDetailInfo>>) => {
  return useSuspenseQuery({
    ...options,
    queryFn: () => getBrandDetail(params),
    select: (res) => res.data,
  });
};
