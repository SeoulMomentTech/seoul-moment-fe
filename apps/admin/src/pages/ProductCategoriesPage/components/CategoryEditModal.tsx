import type { ChangeEventHandler } from "react";

import { X } from "lucide-react";

import { Button, Flex, Input, Label, VStack } from "@seoul-moment/ui";

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose(): void;
  onSubmit(): void | Promise<void>;
  isSubmitting?: boolean;
  editCategoryNameKo: string;
  editCategoryNameEn: string;
  editCategoryNameZh: string;
  onChangeKo: ChangeEventHandler<HTMLInputElement>;
  onChangeEn: ChangeEventHandler<HTMLInputElement>;
  onChangeZh: ChangeEventHandler<HTMLInputElement>;
}

export function CategoryEditModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editCategoryNameKo,
  editCategoryNameEn,
  editCategoryNameZh,
  onChangeKo,
  onChangeEn,
  onChangeZh,
}: CategoryEditModalProps) {
  const disabled =
    isSubmitting ||
    editCategoryNameKo.length === 0 ||
    editCategoryNameEn.length === 0 ||
    editCategoryNameZh.length === 0;

  if (!isOpen) return null;

  return (
    <VStack align="center" className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Flex align="center" className="mb-4" justify="space-between">
          <h2>카테고리 수정</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </Flex>
        <p className="mb-4 text-sm text-gray-500">
          선택한 상품 카테고리의 이름을 수정합니다.
        </p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCategoryNameKo">카테고리 이름(한국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editCategoryNameKo"
              onChange={onChangeKo}
              placeholder="예: 전자기기"
              value={editCategoryNameKo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCategoryNameEn">카테고리 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editCategoryNameEn"
              onChange={onChangeEn}
              placeholder="예: Electronics"
              value={editCategoryNameEn}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCategoryNameZh">카테고리 이름(중국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editCategoryNameZh"
              onChange={onChangeZh}
              placeholder="예: 电子产品"
              value={editCategoryNameZh}
            />
          </div>
        </div>
        <Flex gap={8} justify="flex-end">
          <Button onClick={onClose} variant="outline">
            취소
          </Button>
          <Button disabled={disabled} onClick={onSubmit}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </Flex>
      </div>
    </VStack>
  );
}
