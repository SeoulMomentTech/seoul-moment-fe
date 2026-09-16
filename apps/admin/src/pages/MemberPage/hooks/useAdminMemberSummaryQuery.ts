import {
  useAppQuery,
  type UseAppQueryOptions,
} from "@shared/hooks/useAppQuery";
import { getAdminMemberSummary } from "@shared/services/member";

import { memberQueryKeys } from "./queryKeys";

type AdminMemberSummaryQueryResponse = Awaited<
  ReturnType<typeof getAdminMemberSummary>
>;

type AdminMemberSummaryQueryOptions = Omit<
  UseAppQueryOptions<
    AdminMemberSummaryQueryResponse,
    unknown,
    AdminMemberSummaryQueryResponse,
    ReturnType<typeof memberQueryKeys.summary>
  >,
  "queryKey" | "queryFn"
>;

/** 목록 필터와 무관하게 전체 기준으로 집계되므로 필터가 바뀌어도 다시 부르지 않는다 */
export const useAdminMemberSummaryQuery = (
  options?: AdminMemberSummaryQueryOptions,
) =>
  useAppQuery({
    queryKey: memberQueryKeys.summary(),
    queryFn: getAdminMemberSummary,
    staleTime: 60_000,
    ...options,
  });
