import { Link, useNavigate } from "react-router";

import { ChevronRight, UserX } from "lucide-react";

import type {
  AdminMemberListItem,
  AdminMemberStatus,
} from "@shared/services/member";
import {
  EMPTY_VALUE,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@shared/utils/format";

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

import { MemberProviderBadge } from "../../components";
import { getMemberDetailPath } from "../../constants";

const SKELETON_ROW_KEYS = [
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
] as const;

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

interface MemberTableProps {
  members: AdminMemberListItem[];
  status: AdminMemberStatus;
  isLoading: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  onResetFilters(): void;
}

export function MemberTable({
  members,
  status,
  isLoading,
  isFetching,
  hasActiveFilters,
  onResetFilters,
}: MemberTableProps) {
  const navigate = useNavigate();
  const isWithdrawnView = status === "WITHDRAWN";
  const columnCount = isWithdrawnView ? 8 : 7;

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
          <TableHead className={HEAD_CLASS}>회원</TableHead>
          <TableHead className={HEAD_CLASS}>가입 경로</TableHead>
          <TableHead className={HEAD_CLASS}>연락처</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>주문</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>
            결제 금액
          </TableHead>
          <TableHead className={HEAD_CLASS}>마지막 주문</TableHead>
          <TableHead className={HEAD_CLASS}>가입일</TableHead>
          {isWithdrawnView && (
            <TableHead className={HEAD_CLASS}>탈퇴일</TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          SKELETON_ROW_KEYS.map((key) => (
            <TableRow key={key}>
              <TableCell className={CELL_CLASS}>
                <Skeleton className="h-4 w-28" rounded />
                <Skeleton className="mt-1.5 h-3 w-40" rounded />
              </TableCell>
              {Array.from({ length: columnCount - 1 }, (_, index) => (
                <TableCell
                  className={CELL_CLASS}
                  key={`${key}-cell-${index + 1}`}
                >
                  <Skeleton className="h-4 w-16" rounded />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : members.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-4 py-16" colSpan={columnCount}>
              <div className="flex flex-col items-center gap-2 text-center">
                <UserX className="size-8 text-gray-300" />
                <p className="font-medium text-gray-900">
                  {hasActiveFilters
                    ? "조건에 맞는 회원이 없습니다"
                    : isWithdrawnView
                      ? "탈퇴한 회원이 없습니다"
                      : "아직 가입한 회원이 없습니다"}
                </p>
                <p className="max-w-sm text-sm text-gray-500">
                  {hasActiveFilters
                    ? "검색어와 상세 필터를 줄이면 더 많은 회원이 보입니다."
                    : "서비스에서 회원이 가입하면 이 목록에 바로 나타납니다."}
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
          members.map((member) => {
            const detailPath = getMemberDetailPath(member.id);

            return (
              <TableRow
                className="cursor-pointer focus-within:bg-gray-50"
                key={member.id}
                onClick={() => navigate(detailPath)}
              >
                <TableCell className={CELL_CLASS}>
                  <div className="flex items-center gap-1">
                    <Link
                      className="font-medium text-gray-900 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                      to={detailPath}
                    >
                      {member.nickname}
                    </Link>
                    {member.name && (
                      <span className="text-sm text-gray-500">
                        ({member.name})
                      </span>
                    )}
                    <ChevronRight className="size-3.5 text-gray-300" />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{member.email}</p>
                </TableCell>

                <TableCell className={CELL_CLASS}>
                  <MemberProviderBadge provider={member.provider} />
                </TableCell>

                <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                  {member.phone ?? EMPTY_VALUE}
                </TableCell>

                <TableCell
                  className={cn(CELL_CLASS, "text-right tabular-nums")}
                >
                  {member.orderCount > 0 ? (
                    <span className="text-gray-900">
                      {formatNumber(member.orderCount)}
                    </span>
                  ) : (
                    <span className="text-gray-500">{EMPTY_VALUE}</span>
                  )}
                </TableCell>

                <TableCell
                  className={cn(CELL_CLASS, "text-right tabular-nums")}
                >
                  {member.paidAmount > 0 ? (
                    <span className="font-medium text-gray-900">
                      {formatCurrency(member.paidAmount)}
                    </span>
                  ) : (
                    <span className="text-gray-500">{EMPTY_VALUE}</span>
                  )}
                </TableCell>

                <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                  {formatDate(member.lastOrderDate)}
                </TableCell>

                <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                  {formatDate(member.createDate)}
                </TableCell>

                {isWithdrawnView && (
                  <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                    {formatDate(member.withdrawnAt)}
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
