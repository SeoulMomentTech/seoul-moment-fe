import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import {
  getAdminUserList,
  type GetAdminUserListParams,
} from "@shared/services/user";


import { userQueryKeys } from "./queryKeys";

type AdminUserListQueryResponse = Awaited<ReturnType<typeof getAdminUserList>>;

type AdminUserListQueryOptions = Omit<
  UseAppQueryOptions<
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
  useAppQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getAdminUserList(params),
    ...options,
  });
