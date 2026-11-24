import type { KeyboardEvent } from "react";

import { RotateCcw, Search } from "lucide-react";

import { PageSizeSelect } from "@shared/components/page-size-select";
import type { SortDirection } from "@shared/services/types";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@seoul-moment/ui";

import { DELIVERY_STAGES, ORDER_CHIPS } from "../constants";
import {
  ALL_STAGES,
  type DeliveryStageFilter,
  type OrderListFilters,
} from "../hooks/useOrderListFilters";

/** 모든 필터 컨트롤은 같은 높이를 쓴다. Select 기본 높이(36px)에 맞춘다 */
const CONTROL_HEIGHT = "h-9";

const SORT_LABEL: Record<SortDirection, string> = {
  DESC: "최근 결제순",
  ASC: "오래된 결제순",
};

interface OrderFiltersProps {
  searchInput: string;
  filters: OrderListFilters;
  pageSize: number;
  hasActiveFilters: boolean;
  onSearchInputChange(value: string): void;
  onSearch(): void;
  onFilterChange<K extends keyof OrderListFilters>(
    key: K,
    value: OrderListFilters[K],
  ): void;
  onPageSizeChange(value: number): void;
  onReset(): void;
}

export function OrderFilters({
  searchInput,
  filters,
  pageSize,
  hasActiveFilters,
  onSearchInputChange,
  onSearch,
  onFilterChange,
  onPageSizeChange,
  onReset,
}: OrderFiltersProps) {
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-1.5" role="group">
          {ORDER_CHIPS.map((chip) => (
            <button
              aria-pressed={filters.chip === chip.value}
              className={cn(
                "duration-normal h-8 rounded-full border px-3 text-sm transition-colors",
                filters.chip === chip.value
                  ? "border-gray-900 bg-gray-900 font-medium text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:text-gray-900",
              )}
              key={chip.value}
              onClick={() => onFilterChange("chip", chip.value)}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            className="duration-normal ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-900"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="size-3" />
            필터 전체 해제
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            aria-label="주문 검색"
            className={cn(
              "rounded-md bg-white py-0 pl-9 placeholder:text-gray-500",
              CONTROL_HEIGHT,
            )}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="주문번호 · 받는 분 · 상품명"
            value={searchInput}
          />
        </div>

        <Button className={cn("shrink-0", CONTROL_HEIGHT)} onClick={onSearch}>
          검색
        </Button>

        <div className="flex items-center gap-1.5">
          <Input
            aria-label="결제일 시작 (대만 날짜)"
            className={cn("w-36 rounded-md bg-white py-0", CONTROL_HEIGHT)}
            max={filters.paidTo || undefined}
            onChange={(event) => onFilterChange("paidFrom", event.target.value)}
            type="date"
            value={filters.paidFrom}
          />
          <span className="text-gray-400">~</span>
          <Input
            aria-label="결제일 끝 (대만 날짜)"
            className={cn("w-36 rounded-md bg-white py-0", CONTROL_HEIGHT)}
            min={filters.paidFrom || undefined}
            onChange={(event) => onFilterChange("paidTo", event.target.value)}
            type="date"
            value={filters.paidTo}
          />
        </div>

        <Select
          onValueChange={(value) =>
            onFilterChange("deliveryStage", value as DeliveryStageFilter)
          }
          value={filters.deliveryStage}
        >
          <SelectTrigger
            aria-label="배송 단계"
            className={cn("w-36 bg-white", CONTROL_HEIGHT)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value={ALL_STAGES}>배송 단계 전체</SelectItem>
            {DELIVERY_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            onFilterChange("sort", value as SortDirection)
          }
          value={filters.sort}
        >
          <SelectTrigger
            aria-label="정렬"
            className={cn("w-36 bg-white", CONTROL_HEIGHT)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value="DESC">{SORT_LABEL.DESC}</SelectItem>
            <SelectItem value="ASC">{SORT_LABEL.ASC}</SelectItem>
          </SelectContent>
        </Select>

        <PageSizeSelect onChange={onPageSizeChange} value={pageSize} />
      </div>
    </div>
  );
}
