import { useState, type KeyboardEvent } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { Pagination } from "@shared/components/pagination";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@shared/constants/page";
import type { ProductOptionId } from "@shared/services/productOption";

import { PATH } from "@/shared/constants/route";

import { Button } from "@seoul-moment/ui";

import { ProductOptionFilters, ProductOptionTable } from "./components";
import {
  useAdminProductOptionListQuery,
  useDeleteAdminProductOptionMutation,
} from "./hooks";

export default function ProductOptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<"ASC" | "DESC">(DEFAULT_SORT);
  const { data, isLoading } = useAdminProductOptionListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
  });

  const navigate = useNavigate();

  const { mutateAsync: deleteOption, isPending: isDeleting } =
    useDeleteAdminProductOptionMutation();

  const options = data?.data.list ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

  const handleDeleteOption = async (optionId: ProductOptionId) => {
    const confirmed = confirm("정말 이 옵션을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteOption(optionId, {
        onSuccess: () => {
          setPage(1);
        },
      });
    } catch (error) {
      console.error("옵션 삭제 오류:", error);
      alert("옵션을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="상품에 적용할 옵션을 관리하세요."
        right={
          <Button onClick={() => navigate(PATH.PRODUCT_OPTIONS_ADD)}>
            <Plus className="mr-2 h-4 w-4" />
            옵션 추가
          </Button>
        }
        title="상품 옵션 관리"
      />
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 상품 옵션</p>
        </div>
        <ProductOptionFilters
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
        <ProductOptionTable
          isDeleting={isDeleting}
          isLoading={isLoading}
          onDelete={handleDeleteOption}
          options={options}
        />
      </div>

      <Pagination
        countOnPage={options.length}
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
