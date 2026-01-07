import {
  getAdminProductBannerDetail,
  type ProductBannerId,
} from "@shared/services/productBanner";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { productBannerQueryKeys } from "./queryKeys";

type AdminProductBannerDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductBannerDetail>
>;

type AdminProductBannerDetailQueryOptions = Omit<
  UseQueryOptions<
    AdminProductBannerDetailQueryResponse,
    unknown,
    AdminProductBannerDetailQueryResponse,
    ReturnType<typeof productBannerQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductBannerDetailQuery = (
  bannerId: ProductBannerId | number,
  options?: AdminProductBannerDetailQueryOptions,
) =>
  useQuery({
    queryKey: productBannerQueryKeys.detail(bannerId),
    queryFn: () => getAdminProductBannerDetail(bannerId as ProductBannerId),
    enabled: Boolean(bannerId),
    ...options,
  });
