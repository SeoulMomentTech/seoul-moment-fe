import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminNewsHashtagInfo,
  type AdminNewsHashtagId,
} from "@shared/services/news";

import { newsHashtagQueryKeys } from "./queryKeys";

type AdminNewsHashtagQueryResponse = Awaited<
  ReturnType<typeof getAdminNewsHashtagInfo>
>;

type AdminNewsHashtagQueryOptions = Omit<
  UseAppQueryOptions<
    AdminNewsHashtagQueryResponse,
    unknown,
    AdminNewsHashtagQueryResponse,
    ReturnType<typeof newsHashtagQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsHashtagQuery = (
  hashtagId: AdminNewsHashtagId | number,
  options?: AdminNewsHashtagQueryOptions,
) =>
  useAppQuery({
    queryKey: newsHashtagQueryKeys.detail(hashtagId),
    queryFn: () => getAdminNewsHashtagInfo(hashtagId as AdminNewsHashtagId),
    ...options,
    enabled: options?.enabled ?? Boolean(hashtagId),
  });
