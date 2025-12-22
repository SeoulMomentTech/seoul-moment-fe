import { Search } from "lucide-react";

import { Input } from "@seoul-moment/ui";

interface BrandFiltersProps {
  searchQuery: string;
  onSearchChange(value: string): void;
}

export function BrandFilters({
  searchQuery,
  onSearchChange,
}: BrandFiltersProps) {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          className="h-[40px] rounded-md bg-white pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="브랜드명 검색"
          value={searchQuery}
        />
      </div>
    </div>
  );
}
