import type { KeyboardEvent } from "react";

import { Search } from "lucide-react";

import { PageSizeSelect } from "@/shared/components/page-size-select";

import { Button, HStack, Input } from "@seoul-moment/ui";


interface BrandFiltersProps {
  searchInput: string;
  pageSize: number;
  onSearchChange(value: string): void;
  onPageSizeChange(value: number): void;
  onSearch(): void;
  onSearchKeyPress(event: KeyboardEvent): void;
}

export function BrandFilters({
  searchInput,
  pageSize,
  onSearchChange,
  onPageSizeChange,
  onSearch,
  onSearchKeyPress,
}: BrandFiltersProps) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <HStack gap={16}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-[40px] rounded-md bg-white pl-10"
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyPress}
            placeholder="브랜드명 검색"
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
