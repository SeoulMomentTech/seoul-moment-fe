import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@seoul-moment/ui";

interface BrandPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange(page: number): void;
  onItemsPerPageChange(value: number): void;
  isDisabled?: boolean;
}

export function BrandPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isDisabled,
}: BrandPaginationProps) {
  const startItemNumber =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItemNumber = Math.min(currentPage * itemsPerPage, totalItems);
  const pagesToShow = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1),
  );

  const shouldDisablePrev = isDisabled || currentPage === 1 || totalItems === 0;
  const shouldDisableNext =
    isDisabled || currentPage === totalPages || totalItems === 0;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          전체 {totalItems}개 중 {startItemNumber}-{endItemNumber}개 표시
        </span>
        <select
          className="rounded border border-gray-200 px-2 py-1 text-sm"
          disabled={isDisabled}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
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
          disabled={shouldDisablePrev}
          onClick={() => onPageChange(1)}
          size="sm"
          variant="outline"
        >
          처음
        </Button>
        <Button
          disabled={shouldDisablePrev}
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {pagesToShow.map((page, index) => {
            const prevPage = pagesToShow[index - 1];
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <div className="flex items-center gap-1" key={page}>
                {showEllipsis && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <Button
                  className="min-w-8"
                  disabled={isDisabled}
                  onClick={() => onPageChange(page)}
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
          disabled={shouldDisableNext}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          disabled={shouldDisableNext}
          onClick={() => onPageChange(totalPages)}
          size="sm"
          variant="outline"
        >
          마지막
        </Button>
      </div>
    </div>
  );
}
