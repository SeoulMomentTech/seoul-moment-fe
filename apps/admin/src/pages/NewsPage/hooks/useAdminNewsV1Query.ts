import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminNewsInfoV1, type AdminNewsId } from "@shared/services/news";

import { newsQueryKeys } from "./queryKeys";

type AdminNewsV1QueryResponse = Awaited<
  ReturnType<typeof getAdminNewsInfoV1>
>;

type AdminNewsV1QueryOptions = Omit<
  UseAppQueryOptions<
    AdminNewsV1QueryResponse,
    unknown,
    AdminNewsV1QueryResponse,
    ReturnType<typeof newsQueryKeys.detailV1>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsV1Query = (
  newsId: AdminNewsId | number,
  options?: AdminNewsV1QueryOptions,
) =>
  useAppQuery({
    queryKey: newsQueryKeys.detailV1(newsId),
    queryFn: () => getAdminNewsInfoV1(newsId as AdminNewsId),
    ...options,
    enabled: options?.enabled ?? Boolean(newsId),
  });
