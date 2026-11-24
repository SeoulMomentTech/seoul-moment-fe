import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { UserOrderListStatusFilter } from "@shared/services/userOrder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { ORDER_LIST_FILTERS, ORDER_LIST_PERIODS } from "../model/orderList";

/** 전체 기간은 셀렉트 값으로 쓸 수 없는 null 대신 이 문자열로 둔다 */
const ALL_PERIOD = "all";

interface OrderListFiltersProps {
  status: UserOrderListStatusFilter;
  /** 최근 N개월. null 이면 전체 기간 */
  months: number | null;
  onStatusChange(status: UserOrderListStatusFilter): void;
  onMonthsChange(months: number | null): void;
}

/** 상태 탭과 조회 기간 */
export function OrderListFilters({
  status,
  months,
  onStatusChange,
  onMonthsChange,
}: OrderListFiltersProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10">
      <div
        aria-label={t("order_history")}
        className="flex gap-5 sm:gap-[30px]"
        role="tablist"
      >
        {ORDER_LIST_FILTERS.map((filter) => (
          <button
            aria-selected={status === filter.value}
            className={cn(
              "text-body-3 sm:text-body-2 -mb-px border-b-2 pb-3 font-semibold transition-colors sm:pb-4",
              status === filter.value
                ? "border-black text-black"
                : "border-transparent text-black/40 hover:text-black/70",
            )}
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
            role="tab"
            type="button"
          >
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      <Select
        onValueChange={(value) =>
          onMonthsChange(value === ALL_PERIOD ? null : Number(value))
        }
        value={months === null ? ALL_PERIOD : String(months)}
      >
        <SelectTrigger
          aria-label={t("order_period")}
          className="mb-3 h-9 w-auto min-w-32 gap-2"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_LIST_PERIODS.map((period) => (
            <SelectItem
              key={period ?? ALL_PERIOD}
              value={period === null ? ALL_PERIOD : String(period)}
            >
              {period === null
                ? t("order_period_all")
                : t("order_period_months", { months: period })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
