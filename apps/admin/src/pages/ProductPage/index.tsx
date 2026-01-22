import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { Pagination } from "@shared/components/pagination";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@shared/constants/page";
import { PATH } from "@shared/constants/route";

import { PageHeader } from "@/shared/components/page-header";

import { Button } from "@seoul-moment/ui";

import { ProductFilters, ProductTable } from "./components";
import { useAdminProductItemListQuery } from "./hooks";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<"ASC" | "DESC">(DEFAULT_SORT);
  const { data, isLoading } = useAdminProductItemListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
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

  const toggleSort = () => {
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "TWD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="등록된 상품을 조회하세요."
        right={
          <Button onClick={() => navigate(PATH.PRODUCT_ADD)}>
            <Plus className="mr-2 h-4 w-4" />
            상품 추가
          </Button>
        }
        title="전체 상품"
      />
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 상품</p>
        </div>

        <ProductFilters
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(DEFAULT_PAGE);
          }}
          onSearch={handleSearch}
          onSearchInputChange={setSearchInput}
          onSearchKeyDown={handleSearchKeyPress}
          onToggleSort={toggleSort}
          pageSize={pageSize}
          searchInput={searchInput}
          sort={sort}
        />

        <ProductTable
          formatPrice={formatPrice}
          isLoading={isLoading}
          products={products}
        />
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
}
