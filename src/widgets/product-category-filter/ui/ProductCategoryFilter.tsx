"use client";

import { cn } from "@/shared/lib/style";

interface CategoryItem {
  id: string;
  label: string;
}

interface ProductCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange(categoryId: string): void;
  categories?: CategoryItem[];
  className?: string;
}

const defaultCategories: CategoryItem[] = [
  { id: "all", label: "전체" },
  { id: "outer", label: "아우터" },
  { id: "top", label: "상의" },
  { id: "pants", label: "팬츠" },
  { id: "dress", label: "원피스" },
  { id: "skirt", label: "스커트" },
];

export function ProductCategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
  categories = defaultCategories,
}: ProductCategoryFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {categories.map((category) => (
        <button
          className={cn(
            "cursor-pointer rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200",
            selectedCategory === category.id
              ? "bg-black text-white" // Active state (전체)
              : "border-gray-300 bg-white text-gray-700 hover:bg-black/20 hover:text-gray-900", // Default and hover states
          )}
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
