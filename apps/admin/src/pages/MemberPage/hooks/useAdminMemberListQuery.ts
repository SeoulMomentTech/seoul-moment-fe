import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import {
  getAdminMemberList,
  type GetAdminMemberListParams,
} from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberListQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberList>
>;

type AdminMemberListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberListQueryResponse,
    unknown,
    AdminMemberListQueryResponse,
    ReturnType<typeof memberQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminMemberListQuery = (
  params?: GetAdminMemberListParams,
  options?: AdminMemberListQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.list(params),
    queryFn: () => getAdminMemberList(params),
    placeholderData: (previous) => previous,
    toastOnError: true,
    ...options,
  });
