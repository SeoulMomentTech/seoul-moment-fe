import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminBrandList,
  type AdminBrandListParams,
} from "@shared/services/brand";


import { brandQueryKeys } from "./queryKeys";

type AdminBrandListQueryResponse = Awaited<
  ReturnType<typeof getAdminBrandList>
>;

type AdminBrandListQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: brandQueryKeys.list(params),
    queryFn: () => getAdminBrandList(params),
    ...options,
  });
