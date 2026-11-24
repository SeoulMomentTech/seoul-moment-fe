import { useMemo, useState } from "react";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import type {
  AdminOrderChip,
  AdminOrderDeliveryStage,
  GetAdminOrderListParams,
} from "@shared/services/order";
import type { SortDirection } from "@shared/services/types";

/** 셀렉트에서 "전체"를 고른 상태. API 는 파라미터를 비워 표현한다 */
export const ALL_STAGES = "ALL";

export type DeliveryStageFilter = AdminOrderDeliveryStage | typeof ALL_STAGES;

export interface OrderListFilters {
  chip: AdminOrderChip;
  /** 결제일 시작 (YYYY-MM-DD, 대만 날짜) */
  paidFrom: string;
  /** 결제일 끝 (YYYY-MM-DD, 대만 날짜, 포함) */
  paidTo: string;
  deliveryStage: DeliveryStageFilter;
  sort: SortDirection;
}

export const DEFAULT_ORDER_FILTERS: OrderListFilters = {
  chip: "ALL",
  paidFrom: "",
  paidTo: "",
  deliveryStage: ALL_STAGES,
  sort: "DESC",
};

export function useOrderListFilters() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_ORDER_FILTERS);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const updateFilter = <K extends keyof OrderListFilters>(
    key: K,
    value: OrderListFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(DEFAULT_PAGE);
  };

  /** KPI 카드의 "오늘 신규"는 칩이 없어 결제일 필터로 대신한다 */
  const setPaidRange = (from: string, to: string) => {
    setFilters((prev) => ({ ...prev, chip: "ALL", paidFrom: from, paidTo: to }));
    setPage(DEFAULT_PAGE);
  };

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(DEFAULT_PAGE);
  };

  const resetAll = () => {
    setSearchInput("");
    setSearch("");
    setFilters(DEFAULT_ORDER_FILTERS);
    setPage(DEFAULT_PAGE);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(DEFAULT_PAGE);
  };

  const params = useMemo<GetAdminOrderListParams>(
    () => ({
      page,
      count: pageSize,
      search: search || undefined,
      sort: filters.sort,
      chip: filters.chip,
      paidFrom: filters.paidFrom || undefined,
      paidTo: filters.paidTo || undefined,
      deliveryStage:
        filters.deliveryStage === ALL_STAGES ? undefined : filters.deliveryStage,
    }),
    [filters, page, pageSize, search],
  );

  const hasActiveFilters =
    Boolean(search) ||
    (Object.keys(DEFAULT_ORDER_FILTERS) as (keyof OrderListFilters)[]).some(
      (key) => filters[key] !== DEFAULT_ORDER_FILTERS[key],
    );

  return {
    searchInput,
    filters,
    page,
    pageSize,
    params,
    hasActiveFilters,
    setSearchInput,
    applySearch,
    updateFilter,
    setPaidRange,
    resetAll,
    changePageSize,
    setPage,
  };
}
