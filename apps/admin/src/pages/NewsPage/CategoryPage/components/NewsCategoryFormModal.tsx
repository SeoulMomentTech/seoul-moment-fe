import { useEffect } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { Button, Flex, Input, Label, VStack } from "@seoul-moment/ui";

import type { CategoryNames } from "../utils";

type NewsCategoryFormMode = "create" | "edit";

interface NewsCategoryFormModalProps {
  isOpen: boolean;
  mode: NewsCategoryFormMode;
  defaultValues: CategoryNames;
  onClose(): void;
  onSubmit(values: CategoryNames): void | Promise<void>;
  isSubmitting?: boolean;
}

const MODE_TEXT: Record<
  NewsCategoryFormMode,
  { title: string; description: string; submit: string }
> = {
  create: {
    title: "카테고리 추가",
    description: "새로운 뉴스 카테고리의 다국어 이름을 입력합니다.",
    submit: "추가",
  },
  edit: {
    title: "카테고리 수정",
    description: "선택한 뉴스 카테고리의 이름을 수정합니다.",
    submit: "저장",
  },
};

export function NewsCategoryFormModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
}: NewsCategoryFormModalProps) {
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
    if (isSubmitting) return;

    reset(defaultValues);
    onClose();
  };

  const onValid: SubmitHandler<CategoryNames> = async (values) => {
    await onSubmit(values);
    reset(defaultValues);
  };

  if (!isOpen) return null;

  const text = MODE_TEXT[mode];

  return (
    <VStack
      align="center"
      aria-modal="true"
      as="form"
      className="fixed inset-0 z-50"
      onSubmit={handleSubmit(onValid)}
      role="dialog"
    >
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Flex align="center" className="mb-4" justify="space-between">
          <h2>{text.title}</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </Flex>
        <p className="mb-4 text-sm text-gray-500">{text.description}</p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsCategoryNameKo">카테고리 이름(한국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="newsCategoryNameKo"
              placeholder="예: 브랜드 뉴스"
              {...register("ko", { required: true })}
              disabled={isSubmitting}
            />
            {errors.ko ? (
              <p className="text-sm text-red-500">
                한국어 이름을 입력해주세요.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsCategoryNameEn">카테고리 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="newsCategoryNameEn"
              placeholder="예: Brand News"
              {...register("en", { required: true })}
              disabled={isSubmitting}
            />
            {errors.en ? (
              <p className="text-sm text-red-500">영어 이름을 입력해주세요.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsCategoryNameZh">카테고리 이름(중국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="newsCategoryNameZh"
              placeholder="예: 品牌新聞"
              {...register("zh", { required: true })}
              disabled={isSubmitting}
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
            {isSubmitting ? "저장 중..." : text.submit}
          </Button>
        </Flex>
      </div>
    </VStack>
  );
}
