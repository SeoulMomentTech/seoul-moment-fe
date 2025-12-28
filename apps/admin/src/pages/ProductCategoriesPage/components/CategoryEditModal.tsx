import { useEffect } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { Button, Flex, Input, Label, VStack } from "@seoul-moment/ui";

import type { CategoryNames } from "../utils";

interface CategoryEditModalProps {
  isOpen: boolean;
  defaultValues: CategoryNames;
  onClose(): void;
  onSubmit(values: CategoryNames): void | Promise<void>;
  isSubmitting?: boolean;
}

export function CategoryEditModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
}: CategoryEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<CategoryNames>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onValid: SubmitHandler<CategoryNames> = async (values) => {
    await onSubmit(values);
    reset(defaultValues);
  };

  if (!isOpen) return null;

  return (
    <VStack
      align="center"
      as="form"
      className="fixed inset-0 z-50"
      onSubmit={handleSubmit(onValid)}
    >
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Flex align="center" className="mb-4" justify="space-between">
          <h2>카테고리 수정</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
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
              placeholder="예: 전자기기"
              {...register("ko", { required: true })}
            />
            {errors.ko ? (
              <p className="text-sm text-red-500">
                한국어 이름을 입력해주세요.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCategoryNameEn">카테고리 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editCategoryNameEn"
              placeholder="예: Electronics"
              {...register("en", { required: true })}
            />
            {errors.en ? (
              <p className="text-sm text-red-500">영어 이름을 입력해주세요.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCategoryNameZh">카테고리 이름(중국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editCategoryNameZh"
              placeholder="예: 电子产品"
              {...register("zh", { required: true })}
            />
            {errors.zh ? (
              <p className="text-sm text-red-500">
                중국어 이름을 입력해주세요.
              </p>
            ) : null}
          </div>
        </div>
        <Flex gap={8} justify="flex-end">
          <Button onClick={handleClose} type="button" variant="outline">
            취소
          </Button>
          <Button disabled={isSubmitting || !isValid} type="submit">
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </Flex>
      </div>
    </VStack>
  );
}
