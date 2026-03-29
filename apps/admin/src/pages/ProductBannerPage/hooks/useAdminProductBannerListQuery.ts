import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminProductBannerList,
  type AdminProductBannerListParams,
} from "@shared/services/productBanner";


import { productBannerQueryKeys } from "./queryKeys";

type AdminProductBannerListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductBannerList>
>;

type AdminProductBannerListQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: productBannerQueryKeys.list(params),
    queryFn: () => getAdminProductBannerList(params),
    ...options,
  });
