import { PageHeader } from "@shared/components/page-header";
import { Pagination } from "@shared/components/pagination";

import { useAdminMemberListQuery, useAdminMemberSummaryQuery } from "../hooks";
import {
  MemberFilters,
  MemberResultBar,
  MemberSummaryStrip,
  MemberTable,
} from "./components";
import { useMemberListFilters } from "./hooks";

export function MemberListPage() {
  const {
    searchInput,
    filters,
    page,
    pageSize,
    params,
    chips,
    advancedFilterCount,
    setSearchInput,
    applySearch,
    updateFilter,
    resetAll,
    changePageSize,
    setPage,
  } = useMemberListFilters();

  const {
    data: listResponse,
    isLoading,
    isFetching,
  } = useAdminMemberListQuery(params);

  const { data: summaryResponse, isLoading: isSummaryLoading } =
    useAdminMemberSummaryQuery();

  const members = listResponse?.data.list ?? [];
  const totalItems = listResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="서비스에 가입한 회원을 조회하고 활동 내역을 확인합니다."
        title="회원 관리"
      />

      <MemberSummaryStrip
        isLoading={isSummaryLoading}
        summary={summaryResponse?.data}
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <MemberFilters
          advancedFilterCount={advancedFilterCount}
          filters={filters}
          onFilterChange={updateFilter}
          onPageSizeChange={changePageSize}
          onSearch={applySearch}
          onSearchInputChange={setSearchInput}
          pageSize={pageSize}
          searchInput={searchInput}
        />

        <MemberResultBar
          chips={chips}
          isLoading={isLoading}
          onReset={resetAll}
          totalCount={totalItems}
        />

        <MemberTable
          hasActiveFilters={chips.length > 0}
          isFetching={isFetching}
          isLoading={isLoading}
          members={members}
          onResetFilters={resetAll}
          status={filters.status}
        />

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={members.length}
            disableNext={isFetching || page >= totalPages || totalItems === 0}
            disablePrev={isFetching || page <= 1}
            onNext={() => handlePageChange(page + 1)}
            onPrev={() => handlePageChange(page - 1)}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
