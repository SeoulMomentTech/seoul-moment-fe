import { useState } from "react";

import { Check, Search, X } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";


type UserStatus = "활성" | "비활성";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  status?: UserStatus;
}

const pendingUsers: UserRow[] = [
  {
    id: "pending-1",
    name: "박민수",
    email: "park@example.com",
    role: "사용자",
    joinedAt: "2024-03-10",
  },
];

const approvedUsers: UserRow[] = [
  {
    id: "approved-1",
    name: "김철수",
    email: "kim@example.com",
    role: "관리자",
    status: "활성",
    joinedAt: "2024-01-15",
  },
  {
    id: "approved-2",
    name: "이영희",
    email: "lee@example.com",
    role: "사용자",
    status: "비활성",
    joinedAt: "2024-02-01",
  },
];

const statusClassName: Record<UserStatus, string> = {
  활성: "bg-gray-900 text-white",
  비활성: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesQuery = (user: UserRow) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  };

  const filteredPendingUsers = pendingUsers.filter(matchesQuery);
  const filteredApprovedUsers = approvedUsers.filter(matchesQuery);

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="유저 가입 승인 여부를 관리하세요."
        title="유저 관리"
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-10 rounded-md bg-white pl-10"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            value={searchQuery}
          />
        </div>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          승인 대기 중 ({filteredPendingUsers.length})
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead className="w-32">역할</TableHead>
                <TableHead className="w-40">가입일</TableHead>
                <TableHead className="w-40">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-12 text-center text-gray-500"
                    colSpan={5}
                  >
                    승인 대기 중인 사용자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.joinedAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button className="h-8 gap-2 px-3 text-sm" size="sm">
                          <Check className="h-4 w-4" />
                          승인
                        </Button>
                        <Button
                          className="h-8 gap-2 px-3 text-sm"
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                          거부
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          승인된 사용자 ({filteredApprovedUsers.length})
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead className="w-32">역할</TableHead>
                <TableHead className="w-28">상태</TableHead>
                <TableHead className="w-40">가입일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-12 text-center text-gray-500"
                    colSpan={5}
                  >
                    승인된 사용자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.status ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[user.status]}`}
                        >
                          {user.status}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.joinedAt}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
