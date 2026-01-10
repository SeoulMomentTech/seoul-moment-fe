import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@shared/constants/page";
import { PATH } from "@shared/constants/route";
import type { AdminNewsId } from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import { NewsFilters, NewsTable } from "./components";
import { useAdminNewsListQuery, useDeleteAdminNewsMutation } from "./hooks";

export default function NewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: newsResponse,
    isLoading,
    isFetching,
  } = useAdminNewsListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    searchColumn: "title",
    sort: DEFAULT_SORT,
  });

  const { mutateAsync: deleteNews, isPending: isDeleting } =
    useDeleteAdminNewsMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(DEFAULT_PAGE);
  };

  const handleSearchKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (newsId: AdminNewsId) => {
    if (!confirm("삭제 하시겠습니까?")) {
      return;
    }

    try {
      await deleteNews(newsId);
    } catch (error) {
      console.error("뉴스 삭제 오류:", error);
      alert("뉴스를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const newsList = newsResponse?.data.list ?? [];
  const total = newsResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="뉴스를 조회하고 관리하세요."
        right={
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(PATH.NEWS_ADD)}
          >
            <Plus className="h-4 w-4" />
            뉴스 추가
          </Button>
        }
        title="뉴스 관리"
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 뉴스</p>
        </div>

        <NewsFilters
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(DEFAULT_PAGE);
          }}
          onSearch={handleSearch}
          onSearchInputChange={setSearchInput}
          onSearchKeyPress={handleSearchKeyPress}
          pageSize={pageSize}
          searchInput={searchInput}
        />

        <NewsTable
          hasSearchQuery={Boolean(searchQuery)}
          isDeleting={isDeleting}
          isLoading={isListLoading}
          newsList={newsList}
          onDelete={handleDelete}
        />
      </div>

      <Pagination
        countOnPage={newsList.length}
        disableNext={page >= totalPages}
        disablePrev={page === DEFAULT_PAGE}
        onNext={() => {
          setPage((current) => (current >= totalPages ? current : current + 1));
        }}
        onPrev={() => {
          setPage((current) => Math.max(DEFAULT_PAGE, current - 1));
        }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
