import { useEffect, useMemo } from "react";

import { X } from "lucide-react";

import type { ProductCategoryId } from "@shared/services/productCategory";
import { useForm, type SubmitHandler } from "react-hook-form";

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
    formState: { errors, isValid },
  } = useForm<SubCategoryFormValues>({
    defaultValues: resolvedValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(resolvedValues);
  }, [resolvedValues, reset]);

  const onValid: SubmitHandler<SubCategoryFormValues> = async (values) => {
    await onSubmit(values);
    reset(resolvedValues);
  };

  const handleClose = () => {
    reset(resolvedValues);
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
            <Label htmlFor="editSubcategoryImageUrl">이미지 URL</Label>
            <Input
              className="h-[40px] rounded-md bg-white"
              disabled={isSubmitting}
              id="editSubcategoryImageUrl"
              placeholder="예: https://example.com/image.png"
              {...register("imageUrl")}
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
