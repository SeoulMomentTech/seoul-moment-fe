import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminNewsCategoryInfo,
  type AdminNewsCategoryId,
} from "@shared/services/news";

import { newsCategoryQueryKeys } from "./queryKeys";

type AdminNewsCategoryQueryResponse = Awaited<
  ReturnType<typeof getAdminNewsCategoryInfo>
>;

type AdminNewsCategoryQueryOptions = Omit<
  UseAppQueryOptions<
    AdminNewsCategoryQueryResponse,
    unknown,
    AdminNewsCategoryQueryResponse,
    ReturnType<typeof newsCategoryQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsCategoryQuery = (
  categoryId: AdminNewsCategoryId | number,
  options?: AdminNewsCategoryQueryOptions,
) =>
  useAppQuery({
    queryKey: newsCategoryQueryKeys.detail(categoryId),
    queryFn: () => getAdminNewsCategoryInfo(categoryId as AdminNewsCategoryId),
    ...options,
    enabled: options?.enabled ?? Boolean(categoryId),
  });
