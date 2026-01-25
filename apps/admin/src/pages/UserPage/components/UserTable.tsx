import { Check, X, Ban, RefreshCcw } from "lucide-react";

import { type AdminUser, type AdminUserStatus } from "@shared/services/user";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isFetching: boolean;
  hasSearchQuery: boolean;
  onApprove(id: string): void;
  onReject(id: string): void;
  onBlock(id: string): void;
  onUnblock(id: string): void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const StatusBadge = ({ status }: { status: AdminUserStatus }) => {
  switch (status) {
    case "WAIT":
      return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-500/10">
          승인대기
        </span>
      );
    case "NORMAL":
      return (
        <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-gray-900/10">
          정상
        </span>
      );
    case "BLOCK":
      return (
        <span className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-red-600/10">
          차단
        </span>
      );
    case "DELETE":
      return (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          탈퇴
        </span>
      );
    default:
      return null;
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  // Assuming role is just a string for now, distinct from status
  // Figma shows "사용자", "관리자" badges which look like basic gray badges
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-900">
      {role === "ADMIN" ? "관리자" : "사용자"}
    </span>
  );
};

export function UserTable({
  users,
  isLoading,
  isFetching,
  hasSearchQuery,
  onApprove,
  onReject,
  onBlock,
  onUnblock,
}: UserTableProps) {
  const isListLoading = isLoading || isFetching;

  return (
    <div className="border-t border-gray-200">
      <Table>
        <TableHeader className="bg-white">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px] font-medium text-black">ID</TableHead>
            <TableHead className="w-[120px] font-medium text-black">이름</TableHead>
            <TableHead className="w-[200px] font-medium text-black">이메일</TableHead>
            <TableHead className="w-[100px] font-medium text-black">역할</TableHead>
            <TableHead className="w-[100px] font-medium text-black">상태</TableHead>
            <TableHead className="w-[180px] font-medium text-black">가입일</TableHead>
            <TableHead className="w-[180px] font-medium text-black">수정일</TableHead>
            <TableHead className="w-[180px] font-medium text-black">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isListLoading ? (
            <TableRow>
              <TableCell className="h-[400px] text-center text-gray-500" colSpan={8}>
                유저 정보를 불러오는 중입니다...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell className="h-[400px] text-center text-gray-500" colSpan={8}>
                {hasSearchQuery
                  ? "검색 결과가 없습니다."
                  : "등록된 유저가 없습니다."}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow className="hover:bg-gray-50" key={user.id}>
                <TableCell className="font-normal">{user.id}</TableCell>
                <TableCell className="font-normal">{user.name}</TableCell>
                <TableCell className="font-normal text-gray-600">
                  {user.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {formatDate(user.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.status === "WAIT" && (
                      <>
                        <Button
                          className="h-8 gap-1 bg-gray-900 px-3 hover:bg-gray-800"
                          onClick={() => onApprove(user.id)}
                          size="sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          승인
                        </Button>
                        <Button
                          className="h-8 gap-1 border border-gray-200 bg-white px-3 text-black hover:bg-gray-50"
                          onClick={() => onReject(user.id)}
                          size="sm"
                        >
                          <X className="h-3.5 w-3.5" />
                          거부
                        </Button>
                      </>
                    )}
                    {user.status === "NORMAL" && (
                      <Button
                        className="h-8 gap-1 border border-gray-200 bg-white px-3 text-black hover:bg-gray-50"
                        onClick={() => onBlock(user.id)}
                        size="sm"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        차단
                      </Button>
                    )}
                    {user.status === "BLOCK" && (
                      <Button
                        className="h-8 gap-1 bg-gray-900 px-3 hover:bg-gray-800"
                        onClick={() => onUnblock(user.id)}
                        size="sm"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        차단 해제
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
