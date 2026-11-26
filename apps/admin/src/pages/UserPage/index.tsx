import { useState } from "react";

import { Search } from "lucide-react";

import { CompactInput } from "@shared/components/compact-form";
import { PageHeader } from "@shared/components/page-header";
import { PageSizeSelect } from "@shared/components/page-size-select";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";
import type { AdminUser } from "@shared/services/user";

import { PermissionDialog, UserTable } from "./components";
import { useAdminUserListQuery } from "./hooks";

/** 관리자 권한. 어드민 로그인 계정의 역할·상태를 바꾼다(서비스 회원은 회원 관리) */
export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);

  const debouncedQuery = useDebounceValue(searchQuery, 300);

  const { data, isLoading, isFetching } = useAdminUserListQuery(
    {
      page,
      count: pageSize,
      search: debouncedQuery || undefined,
      sort: "DESC",
    },
    { placeholderData: (previous) => previous, toastOnError: true },
  );

  const users = data?.data.list ?? [];
  const totalItems = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="관리자 계정의 역할과 상태를 바꿉니다. 최고 관리자(super_admin)만 바꿀 수 있습니다."
        title="관리자 권한"
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <CompactInput
              aria-label="관리자 검색"
              className="bg-white pl-9"
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(DEFAULT_PAGE);
              }}
              placeholder="이름 또는 이메일"
              value={searchQuery}
            />
          </div>

          <div className="ml-auto">
            <PageSizeSelect
              onChange={(size) => {
                setPageSize(size);
                setPage(DEFAULT_PAGE);
              }}
              value={pageSize}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <UserTable
            hasSearchQuery={Boolean(debouncedQuery)}
            isFetching={isFetching}
            isLoading={isLoading}
            onEdit={setEditTarget}
            users={users}
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={users.length}
            disableNext={isFetching || page >= totalPages || totalItems === 0}
            disablePrev={isFetching || page <= 1}
            onNext={() => handlePageChange(page + 1)}
            onPrev={() => handlePageChange(page - 1)}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        가입 직후 계정은 ‘관리자 · 승인 대기’입니다. 최고 관리자 기능(환불·강제
        탈퇴·권한 관리)은 역할이 최고 관리자이면서 상태가 정상이어야 쓸 수
        있습니다. 자기 계정은 다른 최고 관리자가 바꿔야 합니다.
      </p>

      {editTarget && (
        <PermissionDialog
          key={editTarget.id}
          onClose={() => setEditTarget(null)}
          user={editTarget}
        />
      )}
    </div>
  );
}
