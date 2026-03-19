import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE } from "@shared/constants/page";
import { PATH } from "@shared/constants/route";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";


import { Button, HStack } from "@seoul-moment/ui";

import { BrandPromotionFilters, BrandPromotionTable } from "./components";
import {
  useBrandPromotionListQuery,
  useDeleteBrandPromotionMutation,
} from "./hooks";

export function BrandPromotionPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 pt-24">
      <HStack align="between" className="mb-6">
        <div>
          <h2 className="mb-2">이벤트 관리</h2>
          <p className="text-gray-600">브랜드 프로모션 이벤트를 관리할 수 있습니다.</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate(PATH.BRAND_PROMOTION_ADD);
          }}
        >
          <Plus className="h-4 w-4" />
          이벤트 추가
        </Button>
      </HStack>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <BrandPromotionListContents />
      </div>
    </div>
  );
}

function BrandPromotionListContents() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedQuery = useDebounceValue(searchQuery, 300);

  const {
    data: promotionResponse,
    isLoading,
    isFetching,
  } = useBrandPromotionListQuery({
    page: currentPage,
    count: itemsPerPage,
    search: debouncedQuery || undefined,
  });

  const { mutateAsync: deletePromotion } = useDeleteBrandPromotionMutation();

  const promotions = promotionResponse?.data?.list ?? [];
  const totalItems = promotionResponse?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleSearchKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    if (!confirm("삭제 하시겠습니까?")) {
      return;
    }

    deletePromotion(id);
  };

  return (
    <>
      <BrandPromotionFilters
        onPageSizeChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        onSearchChange={setSearchInput}
        onSearchKeyPress={handleSearchKeyPress}
        pageSize={itemsPerPage}
        searchInput={searchInput}
      />

      <BrandPromotionTable
        hasSearchQuery={Boolean(searchQuery)}
        isFetching={isFetching}
        isLoading={isLoading}
        onDelete={handleDelete}
        promotions={promotions}
      />

      <div className="border-t border-gray-200 p-4">
        <Pagination
          countOnPage={promotions.length}
          disableNext={currentPage >= totalPages}
          disablePrev={currentPage <= 1}
          onNext={() => handlePageChange(currentPage + 1)}
          onPrev={() => handlePageChange(currentPage - 1)}
          page={currentPage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
