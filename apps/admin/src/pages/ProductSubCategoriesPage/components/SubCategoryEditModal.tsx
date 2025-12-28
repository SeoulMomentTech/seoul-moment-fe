import { useEffect, useMemo, useState } from "react";

import { X } from "lucide-react";

import type { ProductCategoryId } from "@shared/services/productCategory";
import { useForm, type SubmitHandler } from "react-hook-form";

import { ImageUploader } from "@/shared/components/image-uploader";
import { uploadImageFile } from "@/shared/utils/image";

import { Button, Input, Label, VStack } from "@seoul-moment/ui";

import { useAdminProductCategoryQuery } from "../hooks";
import { toSubCategoryFormValues, type SubCategoryFormValues } from "../utils";

interface SubCategoryEditModalProps {
  isOpen: boolean;
  productCategoryId: ProductCategoryId | null;
  defaultValues: SubCategoryFormValues;
  onClose(): void;
  onSubmit(values: SubCategoryFormValues): void | Promise<void>;
  isSubmitting?: boolean;
}

export function SubCategoryEditModal({
  isOpen,
  productCategoryId,
  defaultValues,
  onClose,
  onSubmit,
  isSubmitting,
}: SubCategoryEditModalProps) {
  const { data } = useAdminProductCategoryQuery(
    (productCategoryId ?? 0) as ProductCategoryId,
    {
      enabled: isOpen && Boolean(productCategoryId),
    },
  );

  const resolvedValues = useMemo(() => {
    if (!data?.data) return defaultValues;

    const { categoryId, imageUrl } = toSubCategoryFormValues(data.data);

    return {
      ...defaultValues,
      categoryId,
      imageUrl,
    };
  }, [data?.data, defaultValues]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<SubCategoryFormValues>({
    defaultValues: resolvedValues,
    mode: "onChange",
  });
  const [imagePreview, setImagePreview] = useState(resolvedValues.imageUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    reset(resolvedValues);
    setImagePreview(resolvedValues.imageUrl);
    setValue("imageUrl", resolvedValues.imageUrl ?? "", {
      shouldValidate: true,
    });
  }, [resolvedValues, reset, setValue]);

  const onValid: SubmitHandler<SubCategoryFormValues> = async (values) => {
    await onSubmit({
      ...values,
      imageUrl: values.imageUrl.trim(),
    });
    reset(resolvedValues);
    setImagePreview(resolvedValues.imageUrl);
  };

  const handleClose = () => {
    reset(resolvedValues);
    setImagePreview(resolvedValues.imageUrl);
    onClose();
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
          <h2>서브 카테고리 수정</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
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
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="editSubcategoryNameKo"
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
            <Label htmlFor="editSubcategoryNameEn">
              서브 카테고리 이름(영어)
            </Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="editSubcategoryNameEn"
              placeholder="예: Men's Clothing"
              {...register("en")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editSubcategoryNameZh">
              서브 카테고리 이름(중국어)
            </Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="editSubcategoryNameZh"
              placeholder="예: 男装"
              {...register("zh")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editParentCategoryId">상위 카테고리 ID *</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="editParentCategoryId"
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
            <Label htmlFor="editSubcategoryImageUrl">이미지</Label>
            <ImageUploader
              id="editSubcategoryImage"
              label="서브 카테고리 이미지"
              onChange={async (e) => {
                if (isSubmitting || isUploadingImage) return;
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
                  setImagePreview(resolvedValues.imageUrl);
                } finally {
                  setIsUploadingImage(false);
                }
              }}
              onClear={() => {
                if (isSubmitting || isUploadingImage) return;
                setImagePreview("");
                setValue("imageUrl", "", { shouldValidate: true });
              }}
              preview={imagePreview}
            />
            <input
              className="hidden"
              id="editSubcategoryImageUrl"
              {...register("imageUrl")}
              type="text"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} type="button" variant="outline">
            취소
          </Button>
          <Button disabled={isSubmitting || !isValid} type="submit">
            {isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </div>
      </div>
    </VStack>
  );
}
