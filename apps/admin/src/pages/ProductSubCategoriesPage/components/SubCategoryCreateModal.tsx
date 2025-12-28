import { useEffect } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { Button, Input, Label, VStack } from "@seoul-moment/ui";

import type { SubCategoryFormValues } from "../utils";

interface SubCategoryCreateModalProps {
  isOpen: boolean;
  defaultValues: SubCategoryFormValues;
  onClose(): void;
  onSubmit(values: SubCategoryFormValues): void | Promise<void>;
  isSubmitting?: boolean;
}

export function SubCategoryCreateModal({
  isOpen,
  defaultValues,
  onClose,
  onSubmit,
  isSubmitting,
}: SubCategoryCreateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SubCategoryFormValues>({
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

  const onValid: SubmitHandler<SubCategoryFormValues> = async (values) => {
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
        <div className="mb-4 flex items-center justify-between">
          <h2>새 서브 카테고리 추가</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
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
              placeholder="예: 남성의류"
              {...register("ko", { required: true })}
            />
            {errors.ko ? (
              <p className="text-sm text-red-500">
                한국어 이름을 입력해주세요.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryNameEn">서브 카테고리 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryNameEn"
              placeholder="예: Men's Clothing"
              {...register("en")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryNameZh">
              서브 카테고리 이름(중국어)
            </Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryNameZh"
              placeholder="예: 男装"
              {...register("zh")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentCategoryId">상위 카테고리 ID *</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="parentCategoryId"
              inputMode="numeric"
              placeholder="예: 1"
              {...register("categoryId", {
                required: true,
                min: 1,
                setValueAs: (value) => (value === "" ? "" : Number(value)),
              })}
            />
            {errors.categoryId ? (
              <p className="text-sm text-red-500">
                상위 카테고리 ID를 입력해주세요.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategoryImageUrl">이미지 URL *</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="subcategoryImageUrl"
              placeholder="예: https://example.com/image.png"
              {...register("imageUrl", { required: true })}
            />
            {errors.imageUrl ? (
              <p className="text-sm text-red-500">이미지 URL을 입력해주세요.</p>
            ) : null}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} type="button" variant="outline">
            취소
          </Button>
          <Button disabled={isSubmitting || !isValid} type="submit">
            {isSubmitting ? "추가 중..." : "추가"}
          </Button>
        </div>
      </div>
    </VStack>
  );
}
