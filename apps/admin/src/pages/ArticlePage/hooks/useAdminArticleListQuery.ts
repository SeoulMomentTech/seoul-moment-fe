import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminArticleList,
  type AdminArticleListParams,
} from "@shared/services/article";



import { articleQueryKeys } from "./queryKeys";

type AdminArticleListQueryResponse = Awaited<
  ReturnType<typeof getAdminArticleList>
>;

type AdminArticleListQueryOptions = Omit<
  UseAppQueryOptions<
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
