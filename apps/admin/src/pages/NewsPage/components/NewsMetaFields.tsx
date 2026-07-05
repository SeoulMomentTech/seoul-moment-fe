import {
  cn,
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

type MetaField = "categoryId" | "brandId" | "writer" | "newsCategoryId";

interface NewsMetaFieldsProps {
  values: {
    categoryId: number;
    newsCategoryId: number;
    brandId?: number;
    writer: string;
    editorPick?: boolean;
    hashtagId?: number;
  };
  categoryOptions: SelectOption[];
  newsCategoryOptions: SelectOption[];
  brandOptions: SelectOption[];
  /** 전달 시 해시태그 선택 필드를 렌더링한다. (수정 폼) */
  hashtagOptions?: SelectOption[];
  /** true 시 편집자 추천 토글을 렌더링한다. (수정 폼) */
  showEditorPick?: boolean;
  isCategoryLoading?: boolean;
  isNewsCategoryLoading?: boolean;
  isBrandLoading?: boolean;
  isHashtagLoading?: boolean;
  errors: Record<string, string | undefined>;
  onChange(field: MetaField, value: string): void;
  onEditorPickChange?(checked: boolean): void;
  onHashtagChange?(value: string): void;
}

export function NewsMetaFields({
  values,
  categoryOptions,
  newsCategoryOptions,
  brandOptions,
  hashtagOptions,
  showEditorPick,
  isCategoryLoading,
  isNewsCategoryLoading,
  isBrandLoading,
  isHashtagLoading,
  errors,
  onChange,
  onEditorPickChange,
  onHashtagChange,
}: NewsMetaFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="newsCategoryId">
            뉴스 카테고리 <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => onChange("newsCategoryId", value)}
            value={
              values.newsCategoryId ? values.newsCategoryId.toString() : ""
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue
                placeholder={
                  isNewsCategoryLoading
                    ? "뉴스 카테고리 불러오는 중..."
                    : "뉴스 카테고리 선택"
                }
              />
            </SelectTrigger>
            <SelectContent className="**:cursor-pointer max-h-[320px] bg-white">
              {newsCategoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.newsCategoryId && (
            <p className="text-sm text-red-500">{errors.newsCategoryId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">
            카테고리 <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => onChange("categoryId", value)}
            value={values.categoryId.toString()}
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
            value={
              values.brandId !== undefined && values.brandId !== null
                ? values.brandId.toString()
                : "none"
            }
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
            className={cn(
              "h-[36px] py-2",
              errors.writer ? "border-red-500" : "",
            )}
            id="writer"
            onChange={(e) => onChange("writer", e.target.value)}
            placeholder="작성자 이름"
            value={values.writer}
          />
          {errors.writer && (
            <p className="text-sm text-red-500">{errors.writer}</p>
          )}
        </div>

        {hashtagOptions ? (
          <div className="space-y-2">
            <Label htmlFor="hashtagId">해시태그</Label>
            <Select
              onValueChange={(value) => onHashtagChange?.(value)}
              value={
                values.hashtagId !== undefined && values.hashtagId !== null
                  ? values.hashtagId.toString()
                  : "none"
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue
                  placeholder={
                    isHashtagLoading
                      ? "해시태그 불러오는 중..."
                      : "해시태그 선택"
                  }
                />
              </SelectTrigger>
              <SelectContent className="**:cursor-pointer max-h-[320px] bg-white">
                <SelectItem value="none">선택 안함</SelectItem>
                {hashtagOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {showEditorPick ? (
        <div className="flex items-center gap-2">
          <input
            checked={Boolean(values.editorPick)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            id="editorPick"
            onChange={(event) => onEditorPickChange?.(event.target.checked)}
            type="checkbox"
          />
          <Label className="cursor-pointer" htmlFor="editorPick">
            편집자 추천
          </Label>
        </div>
      ) : null}
    </div>
  );
}
