import { useAppQuery } from "@shared/hooks/useAppQuery";
import {
  getAdminNewsList,
  type AdminNewsListParams,
} from "@shared/services/news";

import { type UseQueryOptions } from "@tanstack/react-query";

import { newsQueryKeys } from "./queryKeys";

type AdminNewsListQueryResponse = Awaited<ReturnType<typeof getAdminNewsList>>;

type AdminNewsListQueryOptions = Omit<
  UseQueryOptions<
    AdminNewsListQueryResponse,
    unknown,
    AdminNewsListQueryResponse,
    ReturnType<typeof newsQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminNewsListQuery = (
  params?: AdminNewsListParams,
  options?: AdminNewsListQueryOptions,
) =>
  useAppQuery({
    queryKey: newsQueryKeys.list(params),
    queryFn: () => getAdminNewsList(params),
    ...options,
  });
