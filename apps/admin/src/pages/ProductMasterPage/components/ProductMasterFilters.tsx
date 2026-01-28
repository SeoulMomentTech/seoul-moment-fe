import type { KeyboardEvent } from "react";

import { Search } from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface ProductMasterFiltersProps {
  pageSize: number;
  searchInput: string;
  onPageSizeChange(size: number): void;
  onSearch(): void;
  onSearchInputChange(value: string): void;
  onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>): void;
}

export const ProductMasterFilters = ({
  pageSize,
  onPageSizeChange,
  searchInput,
  onSearchInputChange,
  onSearch,
  onSearchKeyDown,
}: ProductMasterFiltersProps) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            className="h-[40px] rounded-md bg-white pl-10"
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="대주제명으로 검색..."
            value={searchInput}
          />
        </div>
        <Button onClick={onSearch}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
      </div>

      <Select
        onValueChange={(value) => onPageSizeChange(Number(value))}
        value={pageSize.toString()}
      >
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="개수 선택" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {[10, 20, 50, 100].map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}개씩
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
