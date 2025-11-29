import { useState } from "react";

import { ChevronLeft, ChevronRight, Edit, Search, Trash2 } from "lucide-react";

import type { AdminBrandListItem } from "@shared/services/brand";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

import { useAdminBrandListQuery } from "./hooks";

export function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const {
    data: brandResponse,
    isLoading,
    isFetching,
  } = useAdminBrandListQuery({
    page: currentPage,
    count: itemsPerPage,
    search: searchQuery || undefined,
    searchColumn: "name",
    sort: "DESC",
  });

  const getNameByLanguage = (brand: AdminBrandListItem, languageCode: string) =>
    brand.nameDto.find((name) => name.languageCode === languageCode)?.name ??
    "";

  const brands = brandResponse?.data.list ?? [];
  const totalItems = brandResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItemNumber =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItemNumber = Math.min(currentPage * itemsPerPage, totalItems);

  const handleDelete = (id: number) => {
    if (!confirm("삭제 기능은 준비 중입니다. 계속하시겠습니까?")) {
      return;
    }

    alert(`브랜드 ID ${id} 삭제 기능은 추후 제공됩니다.`);
  };

  return (
    <div className="p-8 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2">브랜드 관리</h2>
          <p className="text-gray-600">브랜드를 등록하고 관리할 수 있습니다.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-[40px] rounded-md bg-white pl-10"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="브랜드명 검색..."
              value={searchQuery}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>한국어</TableHead>
              <TableHead>영어</TableHead>
              <TableHead>중국어(번체)</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-gray-500"
                  colSpan={5}
                >
                  브랜드를 불러오는 중입니다.
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-gray-500"
                  colSpan={5}
                >
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "등록된 브랜드가 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.id}</TableCell>
                  <TableCell>{getNameByLanguage(brand, "ko")}</TableCell>
                  <TableCell className="text-gray-600">
                    {getNameByLanguage(brand, "en")}
                  </TableCell>
                  <TableCell>{getNameByLanguage(brand, "zh-TW")}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(brand.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              전체 {totalItems}개 중 {startItemNumber}-{endItemNumber}개 표시
            </span>
            <select
              className="rounded border border-gray-200 px-2 py-1 text-sm"
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              value={itemsPerPage}
            >
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              size="sm"
              variant="outline"
            >
              처음
            </Button>
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div className="flex items-center gap-1" key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        className="min-w-[2rem]"
                        onClick={() => setCurrentPage(page)}
                        size="sm"
                        variant={currentPage === page ? "default" : "outline"}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              size="sm"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              size="sm"
              variant="outline"
            >
              마지막
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
