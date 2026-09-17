import { memberQueryKeys } from "@pages/MemberPage/hooks/queryKeys";
import { getAdminMemberSummary } from "@shared/services/member";
import { formatNumber } from "@shared/utils/format";

import { useSuspenseQuery } from "@tanstack/react-query";

import { MEMBER_CARD } from "../constants";
import { DashboardCardFrame } from "./DashboardCardFrame";

/**
 * 회원만 전용 집계 API 가 있어서 다른 카드와 따로 둔다.
 *
 * 쿼리 키와 queryFn 을 회원 목록 페이지(useAdminMemberSummaryQuery)와 똑같이 맞춰 캐시를
 * 공유한다 — 덕분에 /members 를 다녀오면 이 카드가 스켈레톤 없이 바로 뜬다. 같은 키에 다른
 * 형태를 넣으면 회원 페이지가 깨지므로 둘 중 하나만 바꾸면 안 된다.
 */
export function MemberCountCard() {
  const { data: response } = useSuspenseQuery({
    queryKey: memberQueryKeys.summary(),
    queryFn: getAdminMemberSummary,
    staleTime: 60_000,
  });

  const summary = response.data;

  return (
    <DashboardCardFrame
      meta={MEMBER_CARD}
      slot={{
        type: "count",
        value: summary.total,
        unit: "명",
        subText: `최근 7일 신규 +${formatNumber(summary.newIn7Days)}`,
      }}
    />
  );
}
