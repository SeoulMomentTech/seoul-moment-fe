import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import { getAdminMember, type AdminMemberId } from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberQueryResponse = Awaited<ReturnType<typeof getAdminMember>>;

type AdminMemberQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberQueryResponse,
    unknown,
    AdminMemberQueryResponse,
    ReturnType<typeof memberQueryKeys.detail>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminMemberQuery = (
  memberId: AdminMemberId,
  options?: AdminMemberQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.detail(memberId),
    queryFn: () => getAdminMember(memberId),
    ...options,
  });
