import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminCategoryList,
  type AdminCategoryListParams,
} from "@shared/services/category";

import { type UseQueryOptions } from "@tanstack/react-query";

import { categoryQueryKeys } from "./queryKeys";

type AdminCategoryListQueryResponse = Awaited<
  ReturnType<typeof getAdminCategoryList>
>;

type AdminCategoryListQueryOptions = Omit<
  UseQueryOptions<
    AdminCategoryListQueryResponse,
    unknown,
    AdminCategoryListQueryResponse,
    ReturnType<typeof categoryQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminCategoryListQuery = (
  params?: AdminCategoryListParams,
  options?: AdminCategoryListQueryOptions,
) =>
  useAppQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => getAdminCategoryList(params),
    ...options,
  });
