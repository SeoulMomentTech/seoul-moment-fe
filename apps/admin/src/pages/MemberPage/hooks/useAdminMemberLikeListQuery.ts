import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import {
  getAdminMemberLikeList,
  type AdminMemberId,
  type GetAdminMemberLikeListParams,
} from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberLikeListQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberLikeList>
>;

type AdminMemberLikeListQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberLikeListQueryResponse,
    unknown,
    AdminMemberLikeListQueryResponse,
    ReturnType<typeof memberQueryKeys.likes>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminMemberLikeListQuery = (
  memberId: AdminMemberId,
  params?: GetAdminMemberLikeListParams,
  options?: AdminMemberLikeListQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.likes(memberId, params),
    queryFn: () => getAdminMemberLikeList(memberId, params),
    placeholderData: (previous) => previous,
    ...options,
  });
