import { getAdminCategory, type CategoryId } from "@shared/services/category";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { categoryQueryKeys } from "./queryKeys";

type AdminCategoryQueryResponse = Awaited<ReturnType<typeof getAdminCategory>>;

type AdminCategoryQueryOptions = Omit<
  UseQueryOptions<
    AdminCategoryQueryResponse,
    unknown,
    AdminCategoryQueryResponse,
    ReturnType<typeof categoryQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminCategoryQuery = (
  categoryId: CategoryId | number,
  options?: AdminCategoryQueryOptions,
) =>
  useQuery({
    queryKey: categoryQueryKeys.detail(categoryId),
    queryFn: () => getAdminCategory(categoryId),
    ...options,
    enabled: options?.enabled ?? Boolean(categoryId),
  });
