import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@seoul-moment/ui";

interface CategoryPaginationProps {
  page: number;
  totalPages: number;
  countOnPage: number;
  onPrev(): void;
  onNext(): void;
  disablePrev: boolean;
  disableNext: boolean;
}

export function CategoryPagination({
  page,
  totalPages,
  countOnPage,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: CategoryPaginationProps) {
  const displayTotalPages = totalPages || 1;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        <p>현재 페이지: {countOnPage}개</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          disabled={disablePrev}
          onClick={onPrev}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">
            {page} / {displayTotalPages}
          </span>
        </div>
        <Button
          disabled={disableNext}
          onClick={onNext}
          size="sm"
          variant="outline"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
