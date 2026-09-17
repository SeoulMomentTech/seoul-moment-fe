import { PageHeader } from "@shared/components/page-header";

import { QueryErrorResetBoundary } from "@tanstack/react-query";

import {
  CountCard,
  DashboardCardBoundary,
  DashboardCardFrame,
  MemberCountCard,
} from "./components";
import {
  BANNER_CARD,
  BANNER_CARD_DESCRIPTION,
  COUNT_CARDS,
  MEMBER_CARD,
} from "./constants";

export default function HomePage() {
  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="관리 영역별 현황을 확인하고 바로 이동하세요."
        title="대시보드"
      />

      {/* 카드별 ErrorBoundary 가 공유하는 리셋 핸들. 재시도 시 해당 쿼리만 다시 돈다 */}
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DashboardCardBoundary meta={MEMBER_CARD} onReset={reset}>
              <MemberCountCard />
            </DashboardCardBoundary>

            {COUNT_CARDS.map((card) => (
              <DashboardCardBoundary key={card.id} meta={card} onReset={reset}>
                <CountCard card={card} />
              </DashboardCardBoundary>
            ))}

            {/* 배너는 조회할 건수가 없어 경계 없이 바로 그린다 */}
            <DashboardCardFrame
              meta={BANNER_CARD}
              slot={{ type: "description", text: BANNER_CARD_DESCRIPTION }}
            />
          </div>
        )}
      </QueryErrorResetBoundary>
    </div>
  );
}
