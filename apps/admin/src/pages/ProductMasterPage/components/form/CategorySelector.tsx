import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import { useCategoryListQuery } from "../../hooks/useCategoryListQuery";

interface CategorySelectorProps {
  value: number;
  error?: string;
  onChange(value: number): void;
}

export const CategorySelector = ({
  value,
  error,
  onChange,
}: CategorySelectorProps) => {
  const { data: categories } = useCategoryListQuery();

  return (
    <div className="space-y-2">
      <Label className="flex" htmlFor="categoryId">
        카테고리 <span className="ml-1 text-red-500">*</span>
      </Label>
      <Select
        onValueChange={(val) => onChange(Number(val))}
        value={value ? value.toString() : ""}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="카테고리 선택" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white">
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.nameDto.find((n) => n.languageCode === "ko")?.name ||
                cat.nameDto[0]?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
