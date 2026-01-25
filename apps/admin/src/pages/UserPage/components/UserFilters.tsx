import { Search } from "lucide-react";

import { type SortDirection } from "@shared/services/types";

import { Input } from "@seoul-moment/ui";

interface UserFiltersProps {
  searchQuery: string;
  sort: SortDirection;
  itemsPerPage: number;
  onSearchChange(value: string): void;
  onSortChange(value: SortDirection): void;
  onItemsPerPageChange(value: number): void;
}

export function UserFilters({
  searchQuery,
  sort,
  itemsPerPage,
  onSearchChange,
  onSortChange,
  onItemsPerPageChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex w-full max-w-md items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-[36px] w-full rounded-md border-gray-200 bg-white pl-10"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            value={searchQuery}
          />
        </div>
        <button className="h-[36px] min-w-[80px] rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800" type='button'>
          검색
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">정렬:</span>
        <select
          className="h-[36px] rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-900"
          onChange={(e) => onSortChange(e.target.value as SortDirection)}
          value={sort}
        >
          <option value="DESC">최신순</option>
          <option value="ASC">오래된순</option>
        </select>

        <select
          className="h-[36px] rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-900"
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          value={itemsPerPage}
        >
          <option value={10}>10개씩</option>
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
        </select>
      </div>
    </div>
  );
}
