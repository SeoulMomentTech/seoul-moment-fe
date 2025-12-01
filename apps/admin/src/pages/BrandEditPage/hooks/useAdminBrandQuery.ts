import { getAdminBrandInfo, type BrandId } from "@shared/services/brand";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { brandQueryKeys } from "./queryKeys";

type AdminBrandQueryResponse = Awaited<ReturnType<typeof getAdminBrandInfo>>;

type AdminBrandQueryOptions = Omit<
  UseQueryOptions<
    AdminBrandQueryResponse,
    unknown,
    AdminBrandQueryResponse,
    ReturnType<typeof brandQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminBrandQuery = (
  brandId: BrandId,
  options?: AdminBrandQueryOptions,
) =>
  useQuery({
    queryKey: brandQueryKeys.detail(brandId),
    queryFn: () => getAdminBrandInfo(brandId),
    ...options,
    enabled: options?.enabled ?? Boolean(brandId),
  });
