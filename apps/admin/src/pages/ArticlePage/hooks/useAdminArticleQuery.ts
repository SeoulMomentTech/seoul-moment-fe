import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminArticleInfo,
  type AdminArticleId,
} from "@shared/services/article";



import { articleQueryKeys } from "./queryKeys";

type AdminArticleQueryResponse = Awaited<
  ReturnType<typeof getAdminArticleInfo>
>;

type AdminArticleQueryOptions = Omit<
  UseAppQueryOptions<
    AdminArticleQueryResponse,
    unknown,
    AdminArticleQueryResponse,
    ReturnType<typeof articleQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminArticleQuery = (
  articleId: AdminArticleId | number,
  options?: AdminArticleQueryOptions,
) =>
  useAppQuery({
    queryKey: articleQueryKeys.detail(articleId),
    queryFn: () => getAdminArticleInfo(articleId as AdminArticleId),
    ...options,
    enabled: options?.enabled ?? Boolean(articleId),
  });
