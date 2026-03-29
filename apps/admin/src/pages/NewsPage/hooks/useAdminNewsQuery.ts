import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminNewsInfo, type AdminNewsId } from "@shared/services/news";


import { newsQueryKeys } from "./queryKeys";

type AdminNewsQueryResponse = Awaited<ReturnType<typeof getAdminNewsInfo>>;

type AdminNewsQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: newsQueryKeys.detail(newsId),
    queryFn: () => getAdminNewsInfo(newsId as AdminNewsId),
    ...options,
    enabled: options?.enabled ?? Boolean(newsId),
  });
