import type { GetAdminOrderSummaryResponse } from "@shared/services/order";
import { formatNumber } from "@shared/utils/format";

import { Skeleton, cn } from "@seoul-moment/ui";

import { formatTaipeiDateTime } from "../lib/taipeiDate";

export type OrderKpiKey = "todayNew" | "waiting" | "ready" | "cancelRequested";

const KPI_CARDS: { key: OrderKpiKey; label: string; accent: string }[] = [
  { key: "todayNew", label: "오늘 신규", accent: "text-gray-900" },
  { key: "waiting", label: "24시간 대기 중", accent: "text-blue-700" },
  { key: "ready", label: "발주 가능", accent: "text-green-700" },
  { key: "cancelRequested", label: "취소 요청", accent: "text-pink-700" },
];

interface OrderKpiCardsProps {
  summary?: GetAdminOrderSummaryResponse;
  isLoading: boolean;
  activeKey: OrderKpiKey | null;
  onSelect(key: OrderKpiKey): void;
}

/**
 * 목록 필터와 무관한 전체 집계다. 네 숫자는 서로 겹칠 수 있어 합산하지 않는다.
 * 카드를 누르면 같은 기준의 칩(오늘 신규는 결제일)을 목록에 건다.
 */
export function OrderKpiCards({
  summary,
  isLoading,
  activeKey,
  onSelect,
}: OrderKpiCardsProps) {
  return (
    <section aria-label="주문 현황">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <button
            aria-pressed={activeKey === card.key}
            className={cn(
              "duration-normal rounded-lg border bg-white px-5 py-4 text-left shadow-sm transition-colors",
              activeKey === card.key
                ? "border-gray-900"
                : "border-gray-200 hover:border-gray-400",
            )}
            disabled={isLoading}
            key={card.key}
            onClick={() => onSelect(card.key)}
            type="button"
          >
            <p className="text-xs text-gray-500">{card.label}</p>
            {isLoading || !summary ? (
              <Skeleton className="mt-2 h-7 w-12" rounded />
            ) : (
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  summary[card.key] > 0 ? card.accent : "text-gray-400",
                )}
              >
                {formatNumber(summary[card.key])}
              </p>
            )}
          </button>
        ))}
      </div>
      {summary && (
        <p className="mt-2 text-xs text-gray-500">
          {formatTaipeiDateTime(summary.asOf)} 기준 (대만 시간) · 1분마다
          갱신됩니다
        </p>
      )}
    </section>
  );
}
