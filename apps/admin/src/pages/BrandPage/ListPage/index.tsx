import { useState } from "react";

import { useNavigate } from "react-router";

import { Plus } from "lucide-react";

import { PATH } from "@shared/constants/route";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";
import type { BrandId } from "@shared/services/brand";

import { Button, HStack } from "@seoul-moment/ui";

import { BrandFilters, BrandPagination, BrandTable } from "./components";
import { useAdminBrandListQuery } from "./hooks";
import { useDeleteAdminBrandMutation } from "../hooks/useDeleteAdminBrandMutation";

export function BrandListPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 pt-24">
      <HStack align="between" className="mb-6">
        <div>
          <h2 className="mb-2">브랜드 관리</h2>
          <p className="text-gray-600">브랜드를 등록하고 관리할 수 있습니다.</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate(PATH.BRAND_ADD)}
        >
          <Plus className="h-4 w-4" />
          브랜드 추가
        </Button>
      </HStack>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <BrandListContents />
      </div>
    </div>
  );
}

function BrandListContents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedQuery = useDebounceValue(searchQuery, 300);

  const {
    data: brandResponse,
    isLoading,
    isFetching,
  } = useAdminBrandListQuery({
    page: currentPage,
    count: itemsPerPage,
    search: debouncedQuery || undefined,
    searchColumn: "name",
    sort: "DESC",
  });

  const { mutateAsync: deleteBrand } = useDeleteAdminBrandMutation();

  const brands = brandResponse?.data.list ?? [];
  const totalItems = brandResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleDelete = (id: BrandId) => {
    if (!confirm("삭제 하시겠습니까?")) {
      return;
    }

    deleteBrand({ brandId: id });
  };

  return (
    <>
      <BrandFilters
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      <BrandTable
        brands={brands}
        hasSearchQuery={Boolean(searchQuery)}
        isFetching={isFetching}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      <BrandPagination
        currentPage={currentPage}
        isDisabled={isLoading || isFetching}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </>
  );
}
