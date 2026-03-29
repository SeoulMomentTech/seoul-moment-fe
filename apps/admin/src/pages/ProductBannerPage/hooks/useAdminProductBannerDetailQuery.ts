import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductBannerDetail,
  type ProductBannerId,
} from "@shared/services/productBanner";


import { productBannerQueryKeys } from "./queryKeys";

type AdminProductBannerDetailQueryResponse = Awaited<
  ReturnType<typeof getAdminProductBannerDetail>
>;

type AdminProductBannerDetailQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: productBannerQueryKeys.detail(bannerId),
    queryFn: () => getAdminProductBannerDetail(bannerId as ProductBannerId),
    enabled: Boolean(bannerId),
    ...options,
  });
