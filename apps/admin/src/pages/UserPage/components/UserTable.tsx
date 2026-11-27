import { ShieldCheck } from "lucide-react";

import { CompactButton } from "@shared/components/compact-form";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from "@shared/services/user";
import { formatDateTime } from "@shared/utils/format";

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
  ADMIN_ROLE_LABEL,
  ADMIN_STATUS_LABEL,
  type ApprovalAction,
} from "../lib/permission";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];
const COLUMN_COUNT = 7;

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

const ROLE_BADGE_CLASS: Record<AdminUserRole, string> = {
  super_admin: "bg-gray-900 text-white",
  admin: "border border-gray-200 bg-white text-gray-700",
};

const STATUS_BADGE_CLASS: Record<AdminUserStatus, string> = {
  WAIT: "bg-amber-50 text-amber-700",
  NORMAL: "bg-green-50 text-green-700",
  BLOCK: "bg-red-50 text-red-700",
  DELETE: "bg-gray-100 text-gray-500",
};

const BADGE_CLASS = "inline-flex rounded px-1.5 py-0.5 text-xs font-medium";

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isFetching: boolean;
  hasSearchQuery: boolean;
  onEdit(user: AdminUser): void;
  onApproval(user: AdminUser, action: ApprovalAction): void;
}

export function UserTable({
  users,
  isLoading,
  isFetching,
  hasSearchQuery,
  onEdit,
  onApproval,
}: UserTableProps) {
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
          <TableHead className={HEAD_CLASS}>ID</TableHead>
          <TableHead className={HEAD_CLASS}>이름</TableHead>
          <TableHead className={HEAD_CLASS}>이메일</TableHead>
          <TableHead className={HEAD_CLASS}>역할</TableHead>
          <TableHead className={HEAD_CLASS}>상태</TableHead>
          <TableHead className={HEAD_CLASS}>가입일</TableHead>
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
        ) : users.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-4 py-16" colSpan={COLUMN_COUNT}>
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="size-8 text-gray-300" />
                <p className="font-medium text-gray-900">
                  {hasSearchQuery
                    ? "검색 결과가 없습니다"
                    : "등록된 관리자 계정이 없습니다"}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className={cn(CELL_CLASS, "tabular-nums")}>
                {user.id}
              </TableCell>
              <TableCell className={CELL_CLASS}>{user.name}</TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {user.email}
              </TableCell>
              <TableCell className={CELL_CLASS}>
                <span className={cn(BADGE_CLASS, ROLE_BADGE_CLASS[user.role])}>
                  {ADMIN_ROLE_LABEL[user.role] ?? user.role}
                </span>
              </TableCell>
              <TableCell className={CELL_CLASS}>
                <span
                  className={cn(BADGE_CLASS, STATUS_BADGE_CLASS[user.status])}
                >
                  {ADMIN_STATUS_LABEL[user.status]}
                </span>
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-sm text-gray-500")}>
                {formatDateTime(user.createDate)}
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-right")}>
                <div className="flex justify-end gap-1.5">
                  {user.status === "WAIT" ? (
                    <>
                      <CompactButton
                        onClick={() => onApproval(user, "approve")}
                        size="sm"
                      >
                        승인
                      </CompactButton>
                      <CompactButton
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onApproval(user, "reject")}
                        size="sm"
                        variant="outline"
                      >
                        거절
                      </CompactButton>
                    </>
                  ) : (
                    <CompactButton
                      onClick={() => onEdit(user)}
                      size="sm"
                      variant="outline"
                    >
                      권한 변경
                    </CompactButton>
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
