import { type KeyboardEvent } from "react";

import { Search, ArrowUpDown } from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface ProductFiltersProps {
  searchInput: string;
  onSearchInputChange(value: string): void;
  onSearch(): void;
  onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void;
  sort: "ASC" | "DESC";
  onToggleSort(): void;
  pageSize: number;
  onPageSizeChange(size: number): void;
}

export const ProductFilters = ({
  searchInput,
  onSearchInputChange,
  onSearch,
  onSearchKeyDown,
  sort,
  onToggleSort,
  pageSize,
  onPageSizeChange,
}: ProductFiltersProps) => (
  <div className="border-b border-gray-200 bg-gray-50 p-4">
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          className="h-[40px] rounded-md bg-white pl-10"
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="상품명으로 검색..."
          value={searchInput}
        />
      </div>
      <Button onClick={onSearch}>
        <Search className="mr-2 h-4 w-4" />
        검색
      </Button>
      <Button onClick={onToggleSort} variant="outline">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        {sort === "ASC" ? "오름차순" : "내림차순"}
      </Button>
      <Select
        onValueChange={(value) => {
          onPageSizeChange(Number(value));
        }}
        value={pageSize.toString()}
      >
        <SelectTrigger className="w-32 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="10">10개씩</SelectItem>
          <SelectItem value="20">20개씩</SelectItem>
          <SelectItem value="50">50개씩</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);
