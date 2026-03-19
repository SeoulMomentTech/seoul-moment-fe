import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@shared/constants/page";
import { PATH } from "@shared/constants/route";

import { Button } from "@seoul-moment/ui";

import { PromotionFilters, PromotionTable } from "./components";
import { useAdminPromotionListQuery, useDeleteAdminPromotionMutation } from "./hooks";

export default function PromotionPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: promotionResponse,
    isLoading,
    isFetching,
  } = useAdminPromotionListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort: DEFAULT_SORT,
  });

  const { mutateAsync: deletePromotion, isPending: isDeleting } =
    useDeleteAdminPromotionMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(DEFAULT_PAGE);
  };

  const handleSearchKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("프로모션을 삭제 하시겠습니까?")) {
      return;
    }

    try {
      await deletePromotion(id);
    } catch (error) {
      console.error("프로모션 삭제 오류:", error);
      alert("프로모션을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const promotionList = promotionResponse?.data.list ?? [];
  const total = promotionResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="프로모션을 조회하고 관리하세요."
        right={
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(PATH.PROMOTION_ADD)}
          >
            <Plus className="h-4 w-4" />
            프로모션 추가
          </Button>
        }
        title="프로모션 관리"
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 프로모션</p>
        </div>

        <PromotionFilters
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

        <PromotionTable
          isDeleting={isDeleting}
          isLoading={isListLoading}
          onDelete={handleDelete}
          promotions={promotionList}
        />
      </div>

      <Pagination
        countOnPage={promotionList.length}
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