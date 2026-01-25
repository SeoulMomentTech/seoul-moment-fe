import { useState } from "react";

import { Pagination } from "@shared/components/pagination";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";
import { type SortDirection } from "@shared/services/types";

import { UserFilters, UserTable } from "./components";
import { useAdminUserListQuery } from "./hooks";

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortDirection>("DESC");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedQuery = useDebounceValue(searchQuery, 300);

  const {
    data: userResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAdminUserListQuery({
    page: currentPage,
    count: itemsPerPage,
    search: debouncedQuery || undefined,
    sort,
  }, {
    enabled: false
  });

  const users = userResponse?.data.list ?? [];
  const totalItems = userResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortDirection) => {
    setSort(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Action handlers (Placeholders)
  const handleApprove = async (id: string) => {
    if (confirm("해당 유저의 가입을 승인하시겠습니까?")) {
      // TODO: Implement approve mutation
      alert(`유저 ${id} 승인 처리 (API 미구현)`);
      refetch();
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("해당 유저의 가입을 거부하시겠습니까?")) {
      // TODO: Implement reject mutation
      alert(`유저 ${id} 거부 처리 (API 미구현)`);
      refetch();
    }
  };

  const handleBlock = async (id: string) => {
    if (confirm("해당 유저를 차단하시겠습니까?")) {
      // TODO: Implement block mutation
      alert(`유저 ${id} 차단 처리 (API 미구현)`);
      refetch();
    }
  };

  const handleUnblock = async (id: string) => {
    if (confirm("해당 유저의 차단을 해제하시겠습니까?")) {
      // TODO: Implement unblock mutation
      alert(`유저 ${id} 차단 해제 처리 (API 미구현)`);
      refetch();
    }
  };

  return (
    <div className="p-8 pt-24">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">유저 관리</h2>
        <p className="text-gray-600">유저 가입 승인 및 상태를 관리하세요.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-sm text-gray-600">총 {totalItems}명의 사용자</p>
        </div>

        <UserFilters
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          searchQuery={searchQuery}
          sort={sort}
        />

        <UserTable
          hasSearchQuery={Boolean(searchQuery)}
          isFetching={isFetching}
          isLoading={isLoading}
          onApprove={handleApprove}
          onBlock={handleBlock}
          onReject={handleReject}
          onUnblock={handleUnblock}
          users={users}
        />

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={users.length}
            disableNext={isLoading || isFetching || currentPage === totalPages || totalItems === 0}
            disablePrev={isLoading || isFetching || currentPage === 1 || totalItems === 0}
            onNext={() => handlePageChange(currentPage + 1)}
            onPrev={() => handlePageChange(currentPage - 1)}
            page={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
