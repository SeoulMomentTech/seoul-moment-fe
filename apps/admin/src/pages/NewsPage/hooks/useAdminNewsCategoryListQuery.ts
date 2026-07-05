import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminNewsCategoryList } from "@shared/services/news";

import { newsCategoryQueryKeys } from "./queryKeys";

type AdminNewsCategoryListQueryResponse = Awaited<
  ReturnType<typeof getAdminNewsCategoryList>
>;

type AdminNewsCategoryListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminNewsCategoryListQueryResponse,
    unknown,
    AdminNewsCategoryListQueryResponse,
    ReturnType<typeof newsCategoryQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsCategoryListQuery = (
  options?: AdminNewsCategoryListQueryOptions,
) =>
  useAppQuery({
    queryKey: newsCategoryQueryKeys.list(),
    queryFn: () => getAdminNewsCategoryList(),
    ...options,
  });
