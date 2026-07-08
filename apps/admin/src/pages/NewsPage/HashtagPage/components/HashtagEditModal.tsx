import { useEffect } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { Button, Flex, Input, Label, VStack } from "@seoul-moment/ui";

import type { HashtagNames } from "../utils";

interface HashtagEditModalProps {
  isOpen: boolean;
  defaultValues: HashtagNames;
  onClose(): void;
  onSubmit(values: HashtagNames): void | Promise<void>;
  isSubmitting?: boolean;
}

export function HashtagEditModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
}: HashtagEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<HashtagNames>({
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

  const onValid: SubmitHandler<HashtagNames> = async (values) => {
    await onSubmit(values);
    reset(defaultValues);
  };

  if (!isOpen) return null;

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
          <h2>해시태그 수정</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </Flex>
        <p className="mb-4 text-sm text-gray-500">
          선택한 뉴스 해시태그의 이름을 수정합니다.
        </p>
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editHashtagNameKo">해시태그 이름(한국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editHashtagNameKo"
              placeholder="예: 서울"
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
            <Label htmlFor="editHashtagNameEn">해시태그 이름(영어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editHashtagNameEn"
              placeholder="예: Seoul"
              {...register("en", { required: true })}
              disabled={isSubmitting}
            />
            {errors.en ? (
              <p className="text-sm text-red-500">영어 이름을 입력해주세요.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editHashtagNameZh">해시태그 이름(중국어)</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              id="editHashtagNameZh"
              placeholder="예: 首爾"
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
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </Flex>
      </div>
    </VStack>
  );
}
