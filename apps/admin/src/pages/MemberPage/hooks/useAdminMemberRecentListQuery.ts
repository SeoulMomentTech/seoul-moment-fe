import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import {
  getAdminMemberRecentList,
  type AdminMemberId,
  type AdminMemberPagingParams,
} from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberRecentListQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberRecentList>
>;

type AdminMemberRecentListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberRecentListQueryResponse,
    unknown,
    AdminMemberRecentListQueryResponse,
    ReturnType<typeof memberQueryKeys.recent>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminMemberRecentListQuery = (
  memberId: AdminMemberId,
  params?: AdminMemberPagingParams,
  options?: AdminMemberRecentListQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.recent(memberId, params),
    queryFn: () => getAdminMemberRecentList(memberId, params),
    placeholderData: (previous) => previous,
    ...options,
  });
