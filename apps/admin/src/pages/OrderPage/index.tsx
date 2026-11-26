import { useEffect, useState } from "react";

import { PageHeader } from "@shared/components/page-header";
import { Pagination } from "@shared/components/pagination";
import type { AdminOrderId, AdminOrderListItem } from "@shared/services/order";

import {
  OrderDrawer,
  OrderFilters,
  OrderKpiCards,
  OrderPurchaseDialog,
  OrderTable,
  type OrderKpiKey,
} from "./components";
import { useAdminOrderListQuery, useAdminOrderSummaryQuery } from "./hooks";
import { useOrderListFilters } from "./hooks/useOrderListFilters";
import { toTaipeiDate } from "./lib/taipeiDate";

/** 남은 시간은 분 단위로 보이므로 30초마다 다시 그리면 충분하다 */
const COUNTDOWN_TICK_MS = 30_000;

const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
};

export function OrderListPage() {
  const {
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
  } = useOrderListFilters();

  const now = useNow(COUNTDOWN_TICK_MS);
  const [detailOrderId, setDetailOrderId] = useState<AdminOrderId | null>(
    null,
  );
  const [purchaseTarget, setPurchaseTarget] =
    useState<AdminOrderListItem | null>(null);

  const {
    data: listResponse,
    dataUpdatedAt,
    isLoading,
    isFetching,
  } = useAdminOrderListQuery(params);
  const { data: summaryResponse, isLoading: isSummaryLoading } =
    useAdminOrderSummaryQuery();

  const orders = listResponse?.data.list ?? [];
  const totalItems = listResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const today = toTaipeiDate(new Date(now));
  const activeKpi: OrderKpiKey | null =
    filters.chip === "WAITING"
      ? "waiting"
      : filters.chip === "READY"
        ? "ready"
        : filters.chip === "CANCEL_REQUESTED"
          ? "cancelRequested"
          : filters.chip === "ALL" &&
              filters.paidFrom === today &&
              filters.paidTo === today
            ? "todayNew"
            : null;

  const handleKpiSelect = (key: OrderKpiKey) => {
    if (key === "todayNew") {
      setPaidRange(today, today);
      return;
    }

    updateFilter(
      "chip",
      key === "waiting"
        ? "WAITING"
        : key === "ready"
          ? "READY"
          : "CANCEL_REQUESTED",
    );
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="결제된 주문을 확인하고, 결제 후 24시간이 지난 주문을 한국에 발주합니다."
        title="주문 목록"
      />

      <OrderKpiCards
        activeKey={activeKpi}
        isLoading={isSummaryLoading}
        onSelect={handleKpiSelect}
        summary={summaryResponse?.data}
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <OrderFilters
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={updateFilter}
          onPageSizeChange={changePageSize}
          onReset={resetAll}
          onSearch={applySearch}
          onSearchInputChange={setSearchInput}
          pageSize={pageSize}
          searchInput={searchInput}
        />

        <div className="overflow-x-auto">
          <OrderTable
            hasActiveFilters={hasActiveFilters}
            isFetching={isFetching}
            isLoading={isLoading}
            now={now}
            onOpenDetail={(order) => setDetailOrderId(order.orderId)}
            onResetFilters={resetAll}
            onStartPurchase={setPurchaseTarget}
            orders={orders}
            receivedAt={dataUpdatedAt}
            selectedOrderId={detailOrderId}
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={orders.length}
            disableNext={isFetching || page >= totalPages || totalItems === 0}
            disablePrev={isFetching || page <= 1}
            onNext={() => handlePageChange(page + 1)}
            onPrev={() => handlePageChange(page - 1)}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      <OrderDrawer
        now={now}
        onClose={() => setDetailOrderId(null)}
        onStartPurchase={setPurchaseTarget}
        orderId={detailOrderId}
      />

      <OrderPurchaseDialog
        onClose={() => setPurchaseTarget(null)}
        order={purchaseTarget}
      />
    </div>
  );
}
