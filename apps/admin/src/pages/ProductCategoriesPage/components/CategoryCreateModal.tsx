import { useEffect } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { Button, Flex, Input, Label, VStack } from "@seoul-moment/ui";

import type { CategoryNames } from "../utils";

interface CategoryCreateModalProps {
  isOpen: boolean;
  defaultValues: Pick<CategoryNames, "ko">;
  onClose(): void;
  onSubmit(value: string): void | Promise<void>;
  isSubmitting?: boolean;
}

export function CategoryCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
}: CategoryCreateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<Pick<CategoryNames, "ko">>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleClose = () => {
    if (isSubmitting) return;

    reset(defaultValues);
    onClose();
  };

  const onValid: SubmitHandler<Pick<CategoryNames, "ko">> = async (values) => {
    await onSubmit(values.ko);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <VStack
      align="center"
      as="form"
      className="fixed inset-0 z-50"
      onSubmit={handleSubmit(onValid)}
    >
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2>새 카테고리 추가</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            disabled={isSubmitting}
            onClick={handleClose}
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
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="categoryNameKo"
              placeholder="예: 전자기기"
              {...register("ko", { required: true })}
            />
            {errors.ko ? (
              <p className="text-sm text-red-500">
                한국어 이름을 입력해주세요.
              </p>
            ) : null}
          </div>
        </div>
        <Flex gap={8} justify="flex-end">
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
            variant="outline"
          >
            취소
          </Button>
          <Button disabled={isSubmitting || !isValid} type="submit">
            {isSubmitting ? "추가 중..." : "추가"}
          </Button>
        </Flex>
      </div>
    </VStack>
  );
}
