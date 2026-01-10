import { getAdminNewsInfo, type AdminNewsId } from "@shared/services/news";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { newsQueryKeys } from "./queryKeys";

type AdminNewsQueryResponse = Awaited<ReturnType<typeof getAdminNewsInfo>>;

type AdminNewsQueryOptions = Omit<
  UseQueryOptions<
    AdminNewsQueryResponse,
    unknown,
    AdminNewsQueryResponse,
    ReturnType<typeof newsQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsQuery = (
  newsId: AdminNewsId | number,
  options?: AdminNewsQueryOptions,
) =>
  useQuery({
    queryKey: newsQueryKeys.detail(newsId),
    queryFn: () => getAdminNewsInfo(newsId as AdminNewsId),
    ...options,
    enabled: options?.enabled ?? Boolean(newsId),
  });
