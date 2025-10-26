import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { CommonRes } from "@shared/services";
import type {
  GetProductBrandBannerReq,
  GetProductBrandBannerRes,
} from "@shared/services/product";
import { getProductBrandBanner } from "@shared/services/product";

interface UseBrandBannerProps<T> {
  options: Omit<UseQueryOptions<T>, "queryFn">;
  params: GetProductBrandBannerReq;
}

export const useBrandBanner = ({
  options,
  params,
}: UseBrandBannerProps<CommonRes<GetProductBrandBannerRes>>) => {
  return useQuery({
    ...options,
    queryFn: () => getProductBrandBanner(params),
    select: (res) => res.data,
  });
};

export const useSuspenseBrandBanner = ({
  options,
  params,
}: UseBrandBannerProps<CommonRes<GetProductBrandBannerRes>>) => {
  return useSuspenseQuery({
    ...options,
    queryFn: () => getProductBrandBanner(params),
    select: (res) => res.data,
  });
};
