import { X } from "lucide-react";

import { Button, Input, Label } from "@seoul-moment/ui";

interface SubCategoryEditModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  editSubcategoryNameKo: string;
  editSubcategoryNameEn: string;
  editSubcategoryNameZh: string;
  editCategoryId: number | "";
  editImageUrl: string;
  onChangeKo(value: string): void;
  onChangeEn(value: string): void;
  onChangeZh(value: string): void;
  onChangeCategoryId(value: number | ""): void;
  onChangeImageUrl(value: string): void;
  onClose(): void;
  onSubmit(): void;
}

export function SubCategoryEditModal({
  isOpen,
  isLoading,
  isSubmitting,
  editSubcategoryNameKo,
  editSubcategoryNameEn,
  editSubcategoryNameZh,
  editCategoryId,
  editImageUrl,
  onChangeKo,
  onChangeEn,
  onChangeZh,
  onChangeCategoryId,
  onChangeImageUrl,
  onClose,
  onSubmit,
}: SubCategoryEditModalProps) {
  if (!isOpen) return null;

  const disableActions = isSubmitting || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2>서브 카테고리 수정</h2>
          <Button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          선택한 서브 카테고리 정보를 수정합니다.
        </p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editSubcategoryNameKo">
              서브 카테고리 이름(한국어) *
            </Label>
            <Input
              disabled={disableActions}
              id="editSubcategoryNameKo"
              onChange={(e) => onChangeKo(e.target.value)}
              placeholder="예: 남성의류"
              value={editSubcategoryNameKo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editSubcategoryNameEn">
              서브 카테고리 이름(영어)
            </Label>
            <Input
              disabled={disableActions}
              id="editSubcategoryNameEn"
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder="예: Men's Clothing"
              value={editSubcategoryNameEn}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editSubcategoryNameZh">
              서브 카테고리 이름(중국어)
            </Label>
            <Input
              disabled={disableActions}
              id="editSubcategoryNameZh"
              onChange={(e) => onChangeZh(e.target.value)}
              placeholder="예: 男装"
              value={editSubcategoryNameZh}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editParentCategoryId">상위 카테고리 ID *</Label>
            <Input
              disabled={disableActions}
              id="editParentCategoryId"
              inputMode="numeric"
              onChange={(e) =>
                onChangeCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="예: 1"
              value={editCategoryId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editSubcategoryImageUrl">이미지 URL *</Label>
            <Input
              disabled={disableActions}
              id="editSubcategoryImageUrl"
              onChange={(e) => onChangeImageUrl(e.target.value)}
              placeholder="예: https://example.com/image.png"
              value={editImageUrl}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            취소
          </Button>
          <Button disabled={disableActions} onClick={onSubmit}>
            {isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </div>
      </div>
    </div>
  );
}
