import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface SelectOption {
  value: number;
  label: string;
}

interface NewsMetaFieldsProps {
  values: {
    categoryId: number;
    brandId?: number;
    writer: string;
  };
  categoryOptions: SelectOption[];
  brandOptions: SelectOption[];
  isCategoryLoading?: boolean;
  isBrandLoading?: boolean;
  errors: Record<string, string | undefined>;
  onChange(field: keyof NewsMetaFieldsProps["values"], value: string): void;
}

export function NewsMetaFields({
  values,
  categoryOptions,
  brandOptions,
  isCategoryLoading,
  isBrandLoading,
  errors,
  onChange,
}: NewsMetaFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="categoryId">
            카테고리 <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => onChange("categoryId", value)}
            value={values.categoryId ? values.categoryId.toString() : ""}
          >
            <SelectTrigger className="bg-white">
              <SelectValue
                placeholder={
                  isCategoryLoading
                    ? "카테고리 불러오는 중..."
                    : "카테고리 선택"
                }
              />
            </SelectTrigger>
            <SelectContent className="**:cursor-pointer max-h-[320px] bg-white">
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandId">브랜드</Label>
          <Select
            onValueChange={(value) => onChange("brandId", value)}
            value={values.brandId ? values.brandId.toString() : "none"}
          >
            <SelectTrigger className="bg-white">
              <SelectValue
                placeholder={
                  isBrandLoading ? "브랜드 불러오는 중..." : "브랜드 선택"
                }
              />
            </SelectTrigger>
            <SelectContent className="**:cursor-pointer max-h-[320px] bg-white">
              <SelectItem value="none">선택 안함</SelectItem>
              {brandOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="writer">
            작성자 <span className="text-red-500">*</span>
          </Label>
          <Input
            className={errors.writer ? "border-red-500" : ""}
            id="writer"
            onChange={(e) => onChange("writer", e.target.value)}
            placeholder="작성자 이름"
            value={values.writer}
          />
          {errors.writer && (
            <p className="text-sm text-red-500">{errors.writer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
