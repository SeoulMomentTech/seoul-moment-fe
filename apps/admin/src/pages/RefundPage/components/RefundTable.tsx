import { ReceiptText } from "lucide-react";

import {
  INVOICE_ADJUST_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  REFUND_STATUS_BADGE_CLASS,
  REFUND_STATUS_LABEL,
} from "@pages/OrderPage/constants";
import { formatTaipeiDateTime } from "@pages/OrderPage/lib/taipeiDate";
import { CompactButton } from "@shared/components/compact-form";
import type { AdminRefundListItem } from "@shared/services/refund";
import { EMPTY_VALUE, formatCurrency } from "@shared/utils/format";

import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import {
  REFUND_ROW_ACTION_LABEL,
  getRefundRowAction,
  type RefundRowAction,
} from "../lib/rowAction";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];
const COLUMN_COUNT = 8;

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

/** 정정이 없으면 발행 여부만 적는다. 발행된 적이 없으면 未開立 */
const getInvoiceLabel = (refund: AdminRefundListItem) => {
  const adjustment = refund.invoiceAdjustment;
  if (!adjustment) return EMPTY_VALUE;
  if (adjustment.adjustStatus !== "NONE") {
    return INVOICE_ADJUST_STATUS_LABEL[adjustment.adjustStatus];
  }
  return adjustment.invoiceStatus === "ISSUED" ? "已開立" : "未開立";
};

const getFailureText = (refund: AdminRefundListItem) =>
  [refund.failureCode, refund.failureMessage].filter(Boolean).join(" · ");

interface RefundTableProps {
  refunds: AdminRefundListItem[];
  isLoading: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  selectedOrderId: number | null;
  onOpenDetail(refund: AdminRefundListItem): void;
  onAction(refund: AdminRefundListItem, action: RefundRowAction): void;
}

export function RefundTable({
  refunds,
  isLoading,
  isFetching,
  hasActiveFilters,
  selectedOrderId,
  onOpenDetail,
  onAction,
}: RefundTableProps) {
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
          <TableHead className={HEAD_CLASS}>고객</TableHead>
          <TableHead className={HEAD_CLASS}>결제수단</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>환불액</TableHead>
          <TableHead className={HEAD_CLASS}>환불</TableHead>
          <TableHead className={HEAD_CLASS}>전자발표</TableHead>
          <TableHead className={HEAD_CLASS}>요청 시각</TableHead>
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
        ) : refunds.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-4 py-16" colSpan={COLUMN_COUNT}>
              <div className="flex flex-col items-center gap-2 text-center">
                <ReceiptText className="size-8 text-gray-300" />
                <p className="font-medium text-gray-900">
                  {hasActiveFilters
                    ? "이 상태의 환불이 없습니다"
                    : "아직 시작된 환불이 없습니다"}
                </p>
                <p className="max-w-sm text-sm text-gray-500">
                  환불을 시작하지 않은 취소 신청은 주문 및 발주 관리의 ‘취소
                  요청’에 있습니다.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          refunds.map((refund) => {
            const action = getRefundRowAction(refund);
            const failureText = getFailureText(refund);
            const isSelected = selectedOrderId === refund.orderId;

            return (
              <TableRow
                aria-selected={isSelected}
                className={cn(isSelected && "bg-gray-100 hover:bg-gray-100")}
                key={refund.refundId}
              >
                <TableCell className={cn(CELL_CLASS, "tabular-nums")}>
                  {refund.orderNumber ?? `#${refund.orderId}`}
                </TableCell>
                <TableCell className={CELL_CLASS}>
                  {refund.recipientName ?? EMPTY_VALUE}
                </TableCell>
                <TableCell className={CELL_CLASS}>
                  {PAYMENT_METHOD_LABEL[refund.method]}
                </TableCell>
                <TableCell
                  className={cn(CELL_CLASS, "text-right tabular-nums")}
                >
                  {formatCurrency(refund.amount)}
                </TableCell>
                <TableCell className={CELL_CLASS}>
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-xs font-medium",
                        REFUND_STATUS_BADGE_CLASS[refund.status],
                      )}
                      title={failureText || undefined}
                    >
                      {REFUND_STATUS_LABEL[refund.status]}
                    </span>
                    {refund.isManual && (
                      <span className="text-xs text-gray-500">수동</span>
                    )}
                    {refund.adminId === null && (
                      <span className="text-xs text-gray-500">자동</span>
                    )}
                  </div>
                  {failureText && (
                    <p className="mt-0.5 max-w-48 truncate text-xs text-gray-500">
                      {failureText}
                    </p>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    CELL_CLASS,
                    "text-sm",
                    refund.invoiceAdjustment?.adjustStatus === "FAILED" &&
                      "text-red-600",
                  )}
                >
                  {getInvoiceLabel(refund)}
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "text-sm text-gray-500")}>
                  {formatTaipeiDateTime(refund.requestedAt)}
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "text-right")}>
                  <div className="flex justify-end gap-1.5">
                    {action && (
                      <CompactButton
                        onClick={() => onAction(refund, action)}
                        size="sm"
                      >
                        {REFUND_ROW_ACTION_LABEL[action]}
                      </CompactButton>
                    )}
                    <CompactButton
                      onClick={() => onOpenDetail(refund)}
                      size="sm"
                      variant="outline"
                    >
                      상세보기
                    </CompactButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
