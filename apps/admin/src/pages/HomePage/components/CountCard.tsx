import { useSuspenseQuery } from "@tanstack/react-query";

import type { DashboardCountCard } from "../constants";
import { DashboardCardFrame } from "./DashboardCardFrame";
import { dashboardQueryKeys } from "../hooks/queryKeys";

interface CountCardProps {
  card: DashboardCountCard;
}

/** 목록 API 의 total 만 보여주는 카드. 형태가 같은 도메인들이 이 컴포넌트를 공유한다 */
export function CountCard({ card }: CountCardProps) {
  const { data: total } = useSuspenseQuery({
    queryKey: dashboardQueryKeys.count(card.id),
    queryFn: card.fetchTotal,
    staleTime: 60_000,
  });

  return (
    <DashboardCardFrame
      meta={card}
      slot={{ type: "count", value: total, unit: card.unit }}
    />
  );
}
