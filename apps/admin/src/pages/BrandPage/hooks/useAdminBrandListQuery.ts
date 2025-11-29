import {
  getAdminBrandList,
  type AdminBrandListParams,
} from "@shared/services/brand";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { brandQueryKeys } from "./queryKeys";

type AdminBrandListQueryResponse = Awaited<
  ReturnType<typeof getAdminBrandList>
>;

type AdminBrandListQueryOptions = Omit<
  UseQueryOptions<
    AdminBrandListQueryResponse,
    unknown,
    AdminBrandListQueryResponse,
    ReturnType<typeof brandQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminBrandListQuery = (
  params?: AdminBrandListParams,
  options?: AdminBrandListQueryOptions,
) =>
  useQuery({
    queryKey: brandQueryKeys.list(params),
    queryFn: () => getAdminBrandList(params),
    ...options,
  });
