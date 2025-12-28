import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, HStack } from "@seoul-moment/ui";

interface SubCategoryPaginationProps {
  page: number;
  totalPages: number;
  countOnPage: number;
  disablePrev: boolean;
  disableNext: boolean;
  onPrev(): void;
  onNext(): void;
}

export function SubCategoryPagination({
  page,
  totalPages,
  countOnPage,
  disablePrev,
  disableNext,
  onPrev,
  onNext,
}: SubCategoryPaginationProps) {
  return (
    <HStack align="between">
      <span className="text-sm text-gray-600">
        현재 페이지: {countOnPage}개
      </span>
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
            {page} / {totalPages || 1}
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
