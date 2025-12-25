import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, HStack } from "@seoul-moment/ui";

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
    <HStack align="between">
      <div className="text-sm text-gray-600">
        <p>이 페이지에 표시: {countOnPage}개</p>
      </div>

      <HStack gap={8}>
        <Button
          disabled={disablePrev}
          onClick={onPrev}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>
        <HStack gap={4}>
          <span className="text-sm text-gray-600">
            {page} / {displayTotalPages}
          </span>
        </HStack>
        <Button
          disabled={disableNext}
          onClick={onNext}
          size="sm"
          variant="outline"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      </HStack>
    </HStack>
  );
}
