import type { AdminMemberId } from "@shared/services/member";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@shared/utils/format";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import { MemberActivitySection } from "./MemberActivitySection";
import { useAdminMemberCartQuery } from "../../hooks";

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

export function MemberCartPanel({ memberId }: { memberId: AdminMemberId }) {
  const { data, isLoading, isFetching } = useAdminMemberCartQuery(memberId);

  const items = data?.data.list ?? [];
  const total = data?.data.total ?? 0;

  return (
    <MemberActivitySection
      emptyMessage="장바구니가 비어 있습니다."
      isEmpty={items.length === 0}
      isFetching={isFetching}
      isLoading={isLoading}
      total={total}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>상품</TableHead>
            <TableHead className={HEAD_CLASS}>옵션</TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>수량</TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>
              적용가
            </TableHead>
            <TableHead className={HEAD_CLASS}>담은 일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className={CELL_CLASS}>
                <span
                  className={cn(
                    "font-medium",
                    item.productName ? "text-gray-900" : "text-gray-500",
                  )}
                >
                  {item.productName ?? "삭제된 상품"}
                </span>
                {!item.isAvailable && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    판매 중지
                  </span>
                )}
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {item.optionText}
              </TableCell>
              <TableCell
                className={cn(
                  CELL_CLASS,
                  "text-right tabular-nums text-gray-900",
                )}
              >
                {formatNumber(item.quantity)}
              </TableCell>
              <TableCell
                className={cn(
                  CELL_CLASS,
                  "text-right tabular-nums text-gray-900",
                )}
              >
                {formatCurrency(item.price)}
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {formatDateTime(item.createDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MemberActivitySection>
  );
}
