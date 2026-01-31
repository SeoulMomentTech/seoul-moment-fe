import type { KeyboardEvent } from "react";

import { Search } from "lucide-react";

import {
  Button,
  HStack,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface BrandFiltersProps {
  searchQuery: string;
  pageSize: number;
  onSearchChange(value: string): void;
  onPageSizeChange(value: number): void;
  onSearch(): void;
  onSearchKeyPress(event: KeyboardEvent): void;
}

export function BrandFilters({
  searchQuery,
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
            value={searchQuery}
          />
        </div>
        <Button onClick={onSearch}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
        <Select
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
          value={pageSize.toString()}
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue className="h-10" />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value="10">10개씩</SelectItem>
            <SelectItem value="20">20개씩</SelectItem>
            <SelectItem value="50">50개씩</SelectItem>
          </SelectContent>
        </Select>
      </HStack>
    </div>
  );
}
