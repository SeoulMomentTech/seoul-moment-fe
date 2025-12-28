import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { ImageUploader } from "@/shared/components/image-uploader";
import { uploadImageFile } from "@/shared/utils/image";

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
    setValue,
    formState: { errors, isValid },
  } = useForm<SubCategoryFormValues>({
    defaultValues,
    mode: "onChange",
  });
  const [imagePreview, setImagePreview] = useState(defaultValues.imageUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    reset(defaultValues);
    setImagePreview(defaultValues.imageUrl);
    setValue("imageUrl", defaultValues.imageUrl ?? "", {
      shouldValidate: true,
    });
  }, [defaultValues, reset, setValue]);

  const handleClose = () => {
    reset(defaultValues);
    setImagePreview(defaultValues.imageUrl);
    onClose();
  };

  const onValid: SubmitHandler<SubCategoryFormValues> = async (values) => {
    await onSubmit({
      ...values,
      imageUrl: values.imageUrl.trim(),
    });
    reset(defaultValues);
    setImagePreview(defaultValues.imageUrl);
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
            <ImageUploader
              id="subcategoryImage"
              label="서브 카테고리 이미지"
              onChange={async (e) => {
                if (isUploadingImage || isSubmitting) return;
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploadingImage(true);
                setImagePreview(URL.createObjectURL(file));
                try {
                  const uploadedPath = await uploadImageFile(
                    file,
                    "product-category",
                  );
                  setValue("imageUrl", uploadedPath, { shouldValidate: true });
                } catch (error) {
                  console.error("이미지 업로드 오류:", error);
                  alert("이미지 업로드 중 오류가 발생했습니다.");
                  setImagePreview("");
                } finally {
                  setIsUploadingImage(false);
                }
              }}
              onClear={() => {
                if (isUploadingImage || isSubmitting) return;
                setImagePreview("");
                setValue("imageUrl", "", { shouldValidate: true });
              }}
              preview={imagePreview}
            />
            <input
              className="hidden"
              id="subcategoryImageUrl"
              {...register("imageUrl", { required: true })}
              type="text"
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
