import { X } from "lucide-react";

import { Button, Input, Label } from "@seoul-moment/ui";

interface SubCategoryCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  newSubcategoryNameKo: string;
  newSubcategoryNameEn: string;
  newSubcategoryNameZh: string;
  newCategoryId: number | "";
  newImageUrl: string;
  onChangeKo(value: string): void;
  onChangeEn(value: string): void;
  onChangeZh(value: string): void;
  onChangeCategoryId(value: number | ""): void;
  onChangeImageUrl(value: string): void;
  onClose(): void;
  onSubmit(): void;
}

export function SubCategoryCreateModal({
  isOpen,
  isSubmitting,
  newSubcategoryNameKo,
  newSubcategoryNameEn,
  newSubcategoryNameZh,
  newCategoryId,
  newImageUrl,
  onChangeKo,
  onChangeEn,
  onChangeZh,
  onChangeCategoryId,
  onChangeImageUrl,
  onClose,
  onSubmit,
}: SubCategoryCreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2>새 서브 카테고리 추가</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          새로운 상품 서브 카테고리를 추가합니다.
        </p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subcategoryNameKo">
              서브 카테고리 이름(한국어) *
            </Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryNameKo"
              onChange={(e) => onChangeKo(e.target.value)}
              placeholder="예: 남성의류"
              value={newSubcategoryNameKo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryNameEn">서브 카테고리 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryNameEn"
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder="예: Men's Clothing"
              value={newSubcategoryNameEn}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryNameZh">
              서브 카테고리 이름(중국어)
            </Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryNameZh"
              onChange={(e) => onChangeZh(e.target.value)}
              placeholder="예: 男装"
              value={newSubcategoryNameZh}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentCategoryId">상위 카테고리 ID *</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="parentCategoryId"
              inputMode="numeric"
              onChange={(e) =>
                onChangeCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="예: 1"
              value={newCategoryId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryImageUrl">이미지 URL *</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryImageUrl"
              onChange={(e) => onChangeImageUrl(e.target.value)}
              placeholder="예: https://example.com/image.png"
              value={newImageUrl}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            취소
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "추가 중..." : "추가"}
          </Button>
        </div>
      </div>
    </div>
  );
}
