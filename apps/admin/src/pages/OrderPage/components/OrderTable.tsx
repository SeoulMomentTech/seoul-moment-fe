import { PackageX } from "lucide-react";

import type { AdminOrderListItem } from "@shared/services/order";
import { EMPTY_VALUE, formatCurrency } from "@shared/utils/format";

import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import { PAYMENT_METHOD_LABEL, TIMER_ROW_CLASS } from "../constants";
import { OrderTimerBadge } from "./OrderTimerBadge";
import { formatTaipeiDateTime } from "../lib/taipeiDate";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];
const COLUMN_COUNT = 8;

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

interface OrderTableProps {
  orders: AdminOrderListItem[];
  isLoading: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  receivedAt: number;
  now: number;
  selectedOrderId: number | null;
  onOpenDetail(order: AdminOrderListItem): void;
  onStartPurchase(order: AdminOrderListItem): void;
  onResetFilters(): void;
}

export function OrderTable({
  orders,
  isLoading,
  isFetching,
  hasActiveFilters,
  receivedAt,
  now,
  selectedOrderId,
  onOpenDetail,
  onStartPurchase,
  onResetFilters,
}: OrderTableProps) {
  return (
    <Table
      aria-busy={isFetching}
      className={cn(
        "duration-normal transition-opacity",
        isFetching && !isLoading && "opacity-60",
      )}
    >
      <TableHeader>
        <TableRow>
          <TableHead className={HEAD_CLASS}>주문번호</TableHead>
          <TableHead className={HEAD_CLASS}>결제일시</TableHead>
          <TableHead className={HEAD_CLASS}>고객</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>
            실제 결제액
          </TableHead>
          <TableHead className={HEAD_CLASS}>24시간 경과/남은 시간</TableHead>
          <TableHead className={HEAD_CLASS}>한국 발주</TableHead>
          <TableHead className={HEAD_CLASS}>취소</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>
            <span className="sr-only">작업</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          SKELETON_ROW_KEYS.map((key) => (
            <TableRow key={key}>
              {Array.from({ length: COLUMN_COUNT }, (_, index) => (
                <TableCell className={CELL_CLASS} key={`${key}-${index}`}>
                  <Skeleton className="h-4 w-16" rounded />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : orders.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-4 py-16" colSpan={COLUMN_COUNT}>
              <div className="flex flex-col items-center gap-2 text-center">
                <PackageX className="size-8 text-gray-300" />
                <p className="font-medium text-gray-900">
                  {hasActiveFilters
                    ? "조건에 맞는 주문이 없습니다"
                    : "아직 결제된 주문이 없습니다"}
                </p>
                <p className="max-w-sm text-sm text-gray-500">
                  결제 완료·입금 대기 주문만 이 목록에 나옵니다.
                </p>
                {hasActiveFilters && (
                  <button
                    className="duration-normal mt-1 text-sm font-medium text-gray-900 underline underline-offset-4 transition-colors hover:text-gray-600"
                    onClick={onResetFilters}
                    type="button"
                  >
                    필터 전체 해제
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow
              aria-selected={selectedOrderId === order.orderId}
              className={cn(
                TIMER_ROW_CLASS[order.timerState],
                selectedOrderId === order.orderId &&
                  "outline-2 -outline-offset-2 outline-gray-900",
              )}
              key={order.orderId}
            >
              <TableCell
                className={cn(CELL_CLASS, "font-medium text-gray-900")}
              >
                {order.orderNumber}
              </TableCell>

              <TableCell
                className={cn(CELL_CLASS, "tabular-nums text-gray-600")}
              >
                {formatTaipeiDateTime(order.paidAt)}
              </TableCell>

              <TableCell className={cn(CELL_CLASS, "text-gray-900")}>
                {order.recipientName ?? EMPTY_VALUE}
              </TableCell>

              <TableCell className={cn(CELL_CLASS, "text-right tabular-nums")}>
                <span className="font-medium text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
                {order.paymentMethod && (
                  <p className="text-xs text-gray-500">
                    {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                  </p>
                )}
              </TableCell>

              <TableCell className={CELL_CLASS}>
                <OrderTimerBadge
                  now={now}
                  receivedAt={receivedAt}
                  timer={order}
                />
              </TableCell>

              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {order.purchaseStatus === "ORDERED" ? (
                  <span className="font-medium text-gray-900">발주 완료</span>
                ) : (
                  "미발주"
                )}
              </TableCell>

              <TableCell className={CELL_CLASS}>
                {order.cancellationRequested ? (
                  <span className="font-medium text-pink-700">접수</span>
                ) : (
                  <span className="text-gray-400">{EMPTY_VALUE}</span>
                )}
              </TableCell>

              <TableCell className={cn(CELL_CLASS, "text-right")}>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => onOpenDetail(order)}
                    size="sm"
                    variant="outline"
                  >
                    상세보기
                  </Button>
                  {order.canStartPurchase && (
                    <Button onClick={() => onStartPurchase(order)} size="sm">
                      발주 시작
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
