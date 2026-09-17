import type { DashboardCountCardId } from "../constants";

export const DASHBOARD_QUERY_KEY = ["admin", "dashboard"] as const;

export const dashboardQueryKeys = {
  all: DASHBOARD_QUERY_KEY,
  /**
   * 카드마다 키가 달라야 각자 따로 로딩되고 따로 재시도된다.
   * 회원 카드는 예외로 memberQueryKeys.summary() 를 그대로 쓴다(캐시 공유).
   */
  count: (cardId: DashboardCountCardId) =>
    [...DASHBOARD_QUERY_KEY, "count", cardId] as const,
};
