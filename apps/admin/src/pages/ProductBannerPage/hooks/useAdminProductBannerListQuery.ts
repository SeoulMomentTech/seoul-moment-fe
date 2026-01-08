import {
  getAdminProductBannerList,
  type AdminProductBannerListParams,
} from "@shared/services/productBanner";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productBannerQueryKeys } from "./queryKeys";

type AdminProductBannerListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductBannerList>
>;

type AdminProductBannerListQueryOptions = Omit<
  UseQueryOptions<
    AdminProductBannerListQueryResponse,
    unknown,
    AdminProductBannerListQueryResponse,
    ReturnType<typeof productBannerQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductBannerListQuery = (
  params?: AdminProductBannerListParams,
  options?: AdminProductBannerListQueryOptions,
) =>
  useQuery({
    queryKey: productBannerQueryKeys.list(params),
    queryFn: () => getAdminProductBannerList(params),
    ...options,
  });
