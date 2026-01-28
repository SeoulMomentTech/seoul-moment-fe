import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import { PATH } from "@shared/constants/route";
import type { SortDirection } from "@shared/services/types";

import { PageHeader } from "@/shared/components/page-header";

import { Button } from "@seoul-moment/ui";

import { ProductMasterFilters, ProductMasterTable } from "./components";
import { useAdminProductListQuery } from "./hooks/useAdminProductListQuery";

export const ProductMasterListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort] = useState<SortDirection>("DESC");

  const { data, isLoading } = useAdminProductListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
    sortColumn: "createDate",
  });

  const products = data?.data.list ?? [];
  const total = data?.data.total ?? 0;

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="상품 대주제를 관리하세요."
        right={
          <Button onClick={() => navigate(PATH.PRODUCT_MASTER_ADD)}>
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        }
        title="상품 대주제 관리"
      />
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 대주제</p>
        </div>

        <ProductMasterFilters
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(DEFAULT_PAGE);
          }}
          onSearch={handleSearch}
          onSearchInputChange={setSearchInput}
          onSearchKeyDown={handleSearchKeyPress}
          pageSize={pageSize}
          searchInput={searchInput}
        />

        <ProductMasterTable isLoading={isLoading} products={products} />
      </div>

      <Pagination
        countOnPage={products.length}
        disableNext={page >= totalPages}
        disablePrev={page === 1}
        onNext={() => {
          setPage((current) => (current >= totalPages ? current : current + 1));
        }}
        onPrev={() => {
          setPage((current) => Math.max(1, current - 1));
        }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};
