"use client";

import { cn } from "@shared/lib/style";

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
    <div className={cn("flex items-center gap-[10px] max-sm:w-max", className)}>
      {categories.map((category) => (
        <button
          className={cn(
            "flex flex-col gap-[8px]",
            "cursor-pointer rounded-full px-[8px] py-2 text-sm font-medium",
            category.id === selectedCategory && "font-semibold",
          )}
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          type="button"
        >
          <div
            className={cn(
              "h-[50px] w-[50px] rounded-full bg-slate-300",
              category.id === selectedCategory && "border",
            )}
          />
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
}
