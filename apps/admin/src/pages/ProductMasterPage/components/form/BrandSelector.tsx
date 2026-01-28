import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import { useBrandListQuery } from "../../hooks/useBrandListQuery";

interface BrandSelectorProps {
  value: number;
  error?: string;
  onChange(value: number): void;
}

export const BrandSelector = ({
  value,
  error,
  onChange,
}: BrandSelectorProps) => {
  const { data: brands } = useBrandListQuery();

  return (
    <div className="space-y-2">
      <Label className="flex" htmlFor="brandId">
        브랜드 <span className="ml-1 text-red-500">*</span>
      </Label>
      <Select
        onValueChange={(val) => onChange(Number(val))}
        value={value ? value.toString() : ""}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="브랜드 선택" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white">
          {brands?.map((brand) => (
            <SelectItem key={brand.id} value={brand.id.toString()}>
              {brand.nameDto.find((n) => n.languageCode === "ko")?.name ||
                brand.nameDto[0]?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
