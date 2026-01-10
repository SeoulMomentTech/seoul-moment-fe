import { Label, Input } from "@seoul-moment/ui";

interface NewsMetaFieldsProps {
  values: {
    categoryId: number;
    brandId?: number;
    writer: string;
  };
  errors: Record<string, string | undefined>;
  onChange(field: keyof NewsMetaFieldsProps["values"], value: string): void;
}

export function NewsMetaFields({
  values,
  errors,
  onChange,
}: NewsMetaFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">
            카테고리 ID <span className="text-red-500">*</span>
          </Label>
          <Input
            className={errors.categoryId ? "border-red-500" : ""}
            id="categoryId"
            onChange={(e) => onChange("categoryId", e.target.value)}
            placeholder="예: 1"
            type="number"
            value={values.categoryId}
          />
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandId">브랜드 ID</Label>
          <Input
            id="brandId"
            onChange={(e) => onChange("brandId", e.target.value)}
            placeholder="선택 입력"
            type="number"
            value={values.brandId ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="writer">
            작성자 <span className="text-red-500">*</span>
          </Label>
          <Input
            className={errors.writer ? "border-red-500" : ""}
            id="writer"
            onChange={(e) => onChange("writer", e.target.value)}
            placeholder="예: 장원영"
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
