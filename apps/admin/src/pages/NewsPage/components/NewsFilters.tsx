import type { KeyboardEvent } from "react";

import { Search } from "lucide-react";

import { PageSizeSelect } from "@/shared/components/page-size-select";

import { Button, HStack, Input } from "@seoul-moment/ui";


interface NewsFiltersProps {
  searchInput: string;
  pageSize: number;
  onSearch(): void;
  onSearchKeyPress(event: KeyboardEvent): void;
  onSearchInputChange(value: string): void;
  onPageSizeChange(value: number): void;
}

export function NewsFilters({
  searchInput,
  pageSize,
  onSearch,
  onSearchKeyPress,
  onSearchInputChange,
  onPageSizeChange,
}: NewsFiltersProps) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <HStack gap={16}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-[40px] rounded-md bg-white pl-10"
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={onSearchKeyPress}
            placeholder="제목 또는 내용으로 검색..."
            value={searchInput}
          />
        </div>
        <Button onClick={onSearch}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
        <PageSizeSelect onChange={onPageSizeChange} value={pageSize} />
      </HStack>
    </div>
  );
}
