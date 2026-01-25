import {
  getAdminUserList,
  type GetAdminUserListParams,
} from "@shared/services/user";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { userQueryKeys } from "./queryKeys";

type AdminUserListQueryResponse = Awaited<ReturnType<typeof getAdminUserList>>;

type AdminUserListQueryOptions = Omit<
  UseQueryOptions<
    AdminUserListQueryResponse,
    unknown,
    AdminUserListQueryResponse,
    ReturnType<typeof userQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminUserListQuery = (
  params?: GetAdminUserListParams,
  options?: AdminUserListQueryOptions,
) =>
  useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getAdminUserList(params),
    ...options,
  });
