import type { ChangeEventHandler } from "react";

import { X } from "lucide-react";

import { Button, Flex, Input, Label } from "@seoul-moment/ui";

interface CategoryCreateModalProps {
  isOpen: boolean;
  onClose(): void;
  onSubmit(): void | Promise<void>;
  isSubmitting?: boolean;
  newCategoryNameKo: string;
  newCategoryNameEn: string;
  newCategoryNameZh: string;
  onChangeKo: ChangeEventHandler<HTMLInputElement>;
  onChangeEn: ChangeEventHandler<HTMLInputElement>;
  onChangeZh: ChangeEventHandler<HTMLInputElement>;
}

export function CategoryCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  newCategoryNameKo,
  newCategoryNameEn,
  newCategoryNameZh,
  onChangeKo,
  onChangeEn,
  onChangeZh,
}: CategoryCreateModalProps) {
  const disabled =
    isSubmitting ||
    newCategoryNameKo.length === 0 ||
    newCategoryNameEn.length === 0 ||
    newCategoryNameZh.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2>새 카테고리 추가</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          새로운 상품 카테고리를 추가합니다.
        </p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryNameKo">카테고리 이름(한국어)</Label>
            <Input
              id="categoryNameKo"
              onChange={onChangeKo}
              placeholder="예: 전자기기"
              value={newCategoryNameKo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryNameEn">카테고리 이름(영어)</Label>
            <Input
              id="categoryNameEn"
              onChange={onChangeEn}
              placeholder="예: Electronics"
              value={newCategoryNameEn}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryNameZh">카테고리 이름(중국어)</Label>
            <Input
              id="categoryNameZh"
              onChange={onChangeZh}
              placeholder="예: 电子产品"
              value={newCategoryNameZh}
            />
          </div>
        </div>
        <Flex gap={8} justify="flex-end">
          <Button onClick={onClose} variant="outline">
            취소
          </Button>
          <Button disabled={disabled} onClick={onSubmit}>
            {isSubmitting ? "추가 중..." : "추가"}
          </Button>
        </Flex>
      </div>
    </div>
  );
}
