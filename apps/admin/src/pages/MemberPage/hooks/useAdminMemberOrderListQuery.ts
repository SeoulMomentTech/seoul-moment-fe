import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import {
  getAdminMemberOrderList,
  type AdminMemberId,
  type GetAdminMemberOrderListParams,
} from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberOrderListQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberOrderList>
>;

type AdminMemberOrderListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberOrderListQueryResponse,
    unknown,
    AdminMemberOrderListQueryResponse,
    ReturnType<typeof memberQueryKeys.orders>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminMemberOrderListQuery = (
  memberId: AdminMemberId,
  params?: GetAdminMemberOrderListParams,
  options?: AdminMemberOrderListQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.orders(memberId, params),
    queryFn: () => getAdminMemberOrderList(memberId, params),
    placeholderData: (previous) => previous,
    ...options,
  });
