import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminCategory, type CategoryId } from "@shared/services/category";


import { categoryQueryKeys } from "./queryKeys";

type AdminCategoryQueryResponse = Awaited<ReturnType<typeof getAdminCategory>>;

type AdminCategoryQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: categoryQueryKeys.detail(categoryId),
    queryFn: () => getAdminCategory(categoryId),
    ...options,
    enabled: options?.enabled ?? Boolean(categoryId),
  });
