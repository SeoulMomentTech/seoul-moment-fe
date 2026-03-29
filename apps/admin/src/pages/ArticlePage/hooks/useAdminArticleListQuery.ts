import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminArticleList,
  type AdminArticleListParams,
} from "@shared/services/article";

import { type UseQueryOptions } from "@tanstack/react-query";


import { articleQueryKeys } from "./queryKeys";

type AdminArticleListQueryResponse = Awaited<
  ReturnType<typeof getAdminArticleList>
>;

type AdminArticleListQueryOptions = Omit<
  UseQueryOptions<
    AdminArticleListQueryResponse,
    unknown,
    AdminArticleListQueryResponse,
    ReturnType<typeof articleQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminArticleListQuery = (
  params?: AdminArticleListParams,
  options?: AdminArticleListQueryOptions,
) =>
  useAppQuery({
    queryKey: articleQueryKeys.list(params),
    queryFn: () => getAdminArticleList(params),
    ...options,
  });
