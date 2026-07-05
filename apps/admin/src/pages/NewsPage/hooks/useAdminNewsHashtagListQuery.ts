import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getAdminNewsHashtagList } from "@shared/services/news";

import { newsHashtagQueryKeys } from "./queryKeys";

type AdminNewsHashtagListQueryResponse = Awaited<
  ReturnType<typeof getAdminNewsHashtagList>
>;

type AdminNewsHashtagListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminNewsHashtagListQueryResponse,
    unknown,
    AdminNewsHashtagListQueryResponse,
    ReturnType<typeof newsHashtagQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsHashtagListQuery = (
  options?: AdminNewsHashtagListQueryOptions,
) =>
  useAppQuery({
    queryKey: newsHashtagQueryKeys.list(),
    queryFn: () => getAdminNewsHashtagList(),
    ...options,
  });
