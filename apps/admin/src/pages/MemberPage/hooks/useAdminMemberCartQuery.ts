import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import {
  getAdminMemberCart,
  type AdminMemberId,
} from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberCartQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberCart>
>;

type AdminMemberCartQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberCartQueryResponse,
    unknown,
    AdminMemberCartQueryResponse,
    ReturnType<typeof memberQueryKeys.cart>
  >,
  "queryKey" | "queryFn"
>;

/** 장바구니는 페이징 없이 전부 내려온다 */
export const useAdminMemberCartQuery = (
  memberId: AdminMemberId,
  options?: AdminMemberCartQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.cart(memberId),
    queryFn: () => getAdminMemberCart(memberId),
    ...options,
  });
