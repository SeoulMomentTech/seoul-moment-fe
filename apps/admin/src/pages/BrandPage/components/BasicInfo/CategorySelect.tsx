import { useMemo } from "react";

import { type AdminCategory } from "@shared/services/category";

import { Label } from "@seoul-moment/ui";

interface CategorySelectProps {
  categories: AdminCategory[];
  value: number | "";
  disabled: boolean;
  onChange(value: number): void;
}

const getCategoryName = (category: AdminCategory) =>
  category.nameDto.find((name) => name.languageCode === "ko")?.name ??
  category.nameDto[0]?.name ??
  `카테고리 ${category.id}`;

export function CategorySelect({
  categories,
  value,
  disabled,
  onChange,
}: CategorySelectProps) {
  const options = useMemo(
    () =>
      categories.map((category) => ({
        id: Number(category.id),
        label: getCategoryName(category),
      })),
    [categories],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="categoryId">
        카테고리 <span className="text-red-500">*</span>
      </Label>
      <select
        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
        disabled={disabled}
        id="categoryId"
        onChange={(e) => onChange(Number(e.target.value))}
        value={value}
      >
        {options.length ? (
          options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))
        ) : (
          <option value="">카테고리가 없습니다</option>
        )}
      </select>
    </div>
  );
}
