import type { KeyboardEvent } from "react";

import { Search } from "lucide-react";

import { Button, HStack, Input } from "@seoul-moment/ui";

interface ProductBannerFiltersProps {
  searchInput: string;
  isDisabled?: boolean;
  onSearch(): void;
  onSearchKeyPress(event: KeyboardEvent): void;
  onSearchInputChange(value: string): void;
}

export function ProductBannerFilters({
  searchInput,
  isDisabled,
  onSearch,
  onSearchKeyPress,
  onSearchInputChange,
}: ProductBannerFiltersProps) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <HStack gap={16}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            className="h-[40px] rounded-md bg-white pl-10"
            disabled={isDisabled}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={onSearchKeyPress}
            placeholder="배너 이미지로 검색..."
            value={searchInput}
          />
        </div>
        <Button disabled={isDisabled} onClick={onSearch}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
      </HStack>
    </div>
  );
}
