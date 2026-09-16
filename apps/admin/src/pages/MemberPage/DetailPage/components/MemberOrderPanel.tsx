import { useState } from "react";

import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE } from "@shared/constants/page";
import type {
  AdminMemberId,
  AdminMemberOrderStatus,
} from "@shared/services/member";
import {
  EMPTY_VALUE,
  formatCurrency,
  formatDateTime,
} from "@shared/utils/format";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import { MemberActivitySection } from "./MemberActivitySection";
import {
  MEMBER_ACTIVITY_PAGE_SIZE,
  MEMBER_ORDER_STATUSES,
  MEMBER_ORDER_STATUS_BADGE_CLASS,
  MEMBER_ORDER_STATUS_LABEL,
  MEMBER_PAYMENT_METHOD_LABEL,
} from "../../constants";
import { useAdminMemberOrderListQuery } from "../../hooks";

const ALL_STATUS = "ALL";

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

export function MemberOrderPanel({ memberId }: { memberId: AdminMemberId }) {
  const [status, setStatus] = useState<
    AdminMemberOrderStatus | typeof ALL_STATUS
  >(ALL_STATUS);
  const [page, setPage] = useState(DEFAULT_PAGE);

  const { data, isLoading, isFetching } = useAdminMemberOrderListQuery(
    memberId,
    {
      page,
      count: MEMBER_ACTIVITY_PAGE_SIZE,
      status: status === ALL_STATUS ? undefined : status,
    },
  );

  const orders = data?.data.list ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MEMBER_ACTIVITY_PAGE_SIZE));

  const handleStatusChange = (value: string) => {
    setStatus(value as AdminMemberOrderStatus | typeof ALL_STATUS);
    setPage(DEFAULT_PAGE);
  };

  return (
    <MemberActivitySection
      emptyMessage={
        status === ALL_STATUS
          ? "아직 주문한 내역이 없습니다."
          : `${MEMBER_ORDER_STATUS_LABEL[status]} 상태인 주문이 없습니다.`
      }
      isEmpty={orders.length === 0}
      isFetching={isFetching}
      isLoading={isLoading}
      pagination={
        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={orders.length}
            disableNext={isFetching || page >= totalPages}
            disablePrev={isFetching || page <= 1}
            onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
            page={page}
            totalPages={totalPages}
          />
        </div>
      }
      toolbar={
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="h-9 w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value={ALL_STATUS}>전체 상태</SelectItem>
            {MEMBER_ORDER_STATUSES.map((orderStatus) => (
              <SelectItem key={orderStatus} value={orderStatus}>
                {MEMBER_ORDER_STATUS_LABEL[orderStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      total={total}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>주문번호</TableHead>
            <TableHead className={HEAD_CLASS}>상태</TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>상품</TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>
              배송비
            </TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>
              결제 금액
            </TableHead>
            <TableHead className={HEAD_CLASS}>결제 수단</TableHead>
            <TableHead className={HEAD_CLASS}>주문 일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell
                className={cn(CELL_CLASS, "font-medium text-gray-900")}
              >
                {order.orderNumber ?? `#${order.id}`}
              </TableCell>
              <TableCell className={CELL_CLASS}>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    MEMBER_ORDER_STATUS_BADGE_CLASS[order.status],
                  )}
                >
                  {MEMBER_ORDER_STATUS_LABEL[order.status]}
                </span>
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-right tabular-nums")}>
                <span className="text-gray-900">
                  {formatCurrency(order.totalProductAmount)}
                </span>
                <span className="text-gray-500"> · {order.itemCount}종</span>
              </TableCell>
              <TableCell
                className={cn(
                  CELL_CLASS,
                  "text-right tabular-nums text-gray-600",
                )}
              >
                {order.shippingFeeApplied > 0
                  ? formatCurrency(order.shippingFeeApplied)
                  : "무료"}
              </TableCell>
              <TableCell
                className={cn(
                  CELL_CLASS,
                  "text-right font-medium tabular-nums text-gray-900",
                )}
              >
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {order.paymentMethod
                  ? MEMBER_PAYMENT_METHOD_LABEL[order.paymentMethod]
                  : EMPTY_VALUE}
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {formatDateTime(order.createDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MemberActivitySection>
  );
}
