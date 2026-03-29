import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminBrandInfo, type BrandId } from "@shared/services/brand";

import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

import { brandQueryKeys } from "./queryKeys";

type AdminBrandQueryResponse = Awaited<ReturnType<typeof getAdminBrandInfo>>;

type AdminBrandQueryOptions = Omit<
  UseAppQueryOptions<
    AdminBrandQueryResponse,
    unknown,
    AdminBrandQueryResponse,
    ReturnType<typeof brandQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

type AdminBrandSuspenseQueryOptions = Omit<
  UseSuspenseQueryOptions<
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
  useAppQuery({
    queryKey: brandQueryKeys.detail(brandId),
    queryFn: () => getAdminBrandInfo(brandId),
    ...options,
    enabled: options?.enabled ?? Boolean(brandId),
  });

export const useAdminBrandSuspenseQuery = (
  brandId: BrandId,
  options?: AdminBrandSuspenseQueryOptions,
) =>
  useSuspenseQuery({
    queryKey: brandQueryKeys.detail(brandId),
    queryFn: () => getAdminBrandInfo(brandId),
    ...options,
  });
