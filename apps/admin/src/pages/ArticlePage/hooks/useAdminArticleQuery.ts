import {
  getAdminArticleInfo,
  type AdminArticleId,
} from "@shared/services/article";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { articleQueryKeys } from "./queryKeys";

type AdminArticleQueryResponse = Awaited<
  ReturnType<typeof getAdminArticleInfo>
>;

type AdminArticleQueryOptions = Omit<
  UseQueryOptions<
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
  useQuery({
    queryKey: articleQueryKeys.detail(articleId),
    queryFn: () => getAdminArticleInfo(articleId as AdminArticleId),
    ...options,
    enabled: options?.enabled ?? Boolean(articleId),
  });
