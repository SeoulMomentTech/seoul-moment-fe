import { useEffect, useRef, type ChangeEvent } from "react";

import { useNavigate } from "react-router";

import { PATH } from "@shared/constants/route";
import type {
  AdminProductItemDetail,
  AdminProductItemId,
  UpdateAdminProductItemRequest,
} from "@shared/services/products";
import { stripImageDomain, uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import { Button } from "@seoul-moment/ui";

import { OptionValueModal } from "../../components/OptionValueModal";
import { ProductBasicInfoSection } from "../../components/ProductBasicInfoSection";
import { ProductImageSection } from "../../components/ProductImageSection";
import { ShippingInfoSection } from "../../components/ShippingInfoSection";
import { VariantSection } from "../../components/VariantSection";
import {
  useAdminProductItemDetailQuery,
  useOptionValueModal,
  useUpdateAdminProductItemMutation,
} from "../../hooks";
import type { OptionValueBadge, ProductFormValues, VariantForm } from "../../types";
import {
  createEmptyVariant,
  createInitialValues,
  parseOptionValueIds,
  validateProductForm,
} from "../../utils";

interface ProductEditFormProps {
  productItemId: AdminProductItemId;
}

const buildInitialValues = (
  detail: AdminProductItemDetail,
): ProductFormValues => ({
  productId: String(detail.productId),
  price: String(detail.price),
  discountPrice: detail.discountPrice ? String(detail.discountPrice) : "",
  shippingCost: String(detail.shippingCost),
  shippingInfo: String(detail.shippingInfo),
  mainImageFile: null,
  mainImagePreview: detail.mainImageUrl ?? "",
  imageUrlList: detail.imageUrlList ?? [],
  variants:
    detail.variantList.length > 0
      ? detail.variantList.map((variant) => {
          const badges: OptionValueBadge[] = variant.optionValueList.map(
            (value) => ({
              id: value.id,
              label: value.value,
            }),
          );

          return {
            sku: variant.sku,
            stockQuantity: String(variant.stockQuantity),
            optionValueIds: badges.map((badge) => badge.id).join(", "),
            optionValueBadgeList: badges,
          };
        })
      : [createEmptyVariant()],
});

export default function ProductEditForm({
  productItemId,
}: ProductEditFormProps) {
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const { data: detailResponse, isLoading } =
    useAdminProductItemDetailQuery(productItemId);
  const detail = detailResponse?.data;

  const { mutateAsync: updateProductItem, isPending } =
    useUpdateAdminProductItemMutation({
      onSuccess: () => navigate(PATH.PRODUCTS),
    });

  const formik = useFormik<ProductFormValues>({
    initialValues: createInitialValues(),
    validateOnBlur: false,
    validateOnChange: false,
    validate: validateProductForm,
    onSubmit: async (values) => {
      // validateProductForm에서 mainImageFile 또는 mainImagePreview가 없는 경우를 잡으므로
      // 여기서는 둘 중 하나가 반드시 존재한다고 가정 가능

      try {
        let mainImageUrl = "";

        if (values.mainImageFile) {
          // 새 파일이 업로드된 경우
          const { imagePath } = await uploadImageFile(
            values.mainImageFile,
            "product",
          );
          mainImageUrl = stripImageDomain(imagePath);
        } else if (values.mainImagePreview) {
          // 기존 이미지가 유지된 경우 (preview URL 사용)
          mainImageUrl = stripImageDomain(values.mainImagePreview);
        }

        const payload: UpdateAdminProductItemRequest = {
          productId: Number(values.productId),
          mainImageUrl,
          price: Number(values.price),
          discountPrice: values.discountPrice
            ? Number(values.discountPrice)
            : undefined,
          shippingCost: Number(values.shippingCost),
          shippingInfo: Number(values.shippingInfo),
          imageUrlList: values.imageUrlList.map(stripImageDomain),
          variantList: values.variants.map((variant) => ({
            sku: variant.sku.trim(),
            stockQuantity: Number(variant.stockQuantity),
            optionValueList: parseOptionValueIds(variant.optionValueIds),
          })),
        };

        await updateProductItem({ productItemId, payload });
      } catch (error) {
        console.error("상품 아이템 수정 오류:", error);
        alert("상품 아이템을 수정하는 중 오류가 발생했습니다.");
      }
    },
  });

  const { setFieldValue, setValues } = formik;

  const {
    isOpen: isOptionModalOpen,
    selectedOptionId,
    selectedValueIds,
    openModal: handleOpenOptionModal,
    closeModal: handleCloseOptionModal,
    selectOption: handleSelectOption,
    toggleValue: handleToggleValue,
    confirmSelection: handleConfirmOptionValues,
  } = useOptionValueModal({
    variants: formik.values.variants,
    onUpdateVariants: (newVariants) => setFieldValue("variants", newVariants),
  });

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (formik.values.mainImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formik.values.mainImagePreview);
      }
    };
  }, [formik.values.mainImagePreview]);

  useEffect(() => {
    if (!detail || initializedRef.current) {
      return;
    }

    const nextValues = buildInitialValues(detail);
    setValues(nextValues, true);
    initializedRef.current = true;
  }, [detail, setValues]);

  useEffect(() => {
    initializedRef.current = false;
  }, [productItemId]);

  const handleAddVariant = () =>
    setFieldValue("variants", [
      ...formik.values.variants,
      createEmptyVariant(),
    ]);

  const handleRemoveVariant = (index: number) =>
    setFieldValue(
      "variants",
      formik.values.variants.filter((_, idx) => idx !== index),
    );

  const handleVariantChange = (
    index: number,
    field: keyof VariantForm,
    value: VariantForm[keyof VariantForm],
  ) => {
    setFieldValue(
      "variants",
      formik.values.variants.map((variant, idx) =>
        idx === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const handleVariantUpdate = (index: number, nextVariant: VariantForm) => {
    setFieldValue(
      "variants",
      formik.values.variants.map((variant, idx) =>
        idx === index ? nextVariant : variant,
      ),
    );
  };

  const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    // Revoke previous object URL if exists
    if (formik.values.mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formik.values.mainImagePreview);
    }
    setFieldValue("mainImageFile", file);
    setFieldValue("mainImagePreview", URL.createObjectURL(file));
  };

  const handleMainImageClear = () => {
    if (!confirm("대표 이미지를 삭제하시겠습니까?")) {
      return;
    }
    // Revoke previous object URL if exists
    if (formik.values.mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formik.values.mainImagePreview);
    }
    setFieldValue("mainImageFile", null);
    setFieldValue("mainImagePreview", "");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-600">
        상품 아이템 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-600">
        상품 아이템 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <>
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <ProductBasicInfoSection formik={formik} isPending={isPending} />
        <ShippingInfoSection formik={formik} isPending={isPending} />
        <div className="space-y-1">
          <ProductImageSection
            imageUrlList={formik.values.imageUrlList}
            mainImagePreview={formik.values.mainImagePreview}
            onImageUrlListChange={(urls) => setFieldValue("imageUrlList", urls)}
            onMainImageChange={handleMainImageChange}
            onMainImageClear={handleMainImageClear}
          />
          {formik.errors.mainImageFile && (
            <p className="text-xs text-red-500">
              {formik.errors.mainImageFile}
            </p>
          )}
        </div>
        <VariantSection
          error={formik.errors.variants as string | undefined}
          isPending={isPending}
          onAddVariant={handleAddVariant}
          onOpenOptionModal={handleOpenOptionModal}
          onRemoveVariant={handleRemoveVariant}
          onUpdateVariant={handleVariantUpdate}
          onVariantChange={handleVariantChange}
          variants={formik.values.variants}
        />

        <div className="flex justify-end gap-3">
          <Button className="w-[140px]" disabled={isPending} type="submit">
            {isPending ? "저장 중..." : "저장"}
          </Button>
          <Button
            className="w-[140px]"
            disabled={isPending}
            onClick={() => navigate(PATH.PRODUCTS)}
            type="button"
            variant="outline"
          >
            취소
          </Button>
        </div>
      </form>

      <OptionValueModal
        isOpen={isOptionModalOpen}
        onClose={handleCloseOptionModal}
        onConfirm={handleConfirmOptionValues}
        onSelectOption={handleSelectOption}
        onToggleValue={handleToggleValue}
        selectedOptionId={selectedOptionId}
        selectedValueIds={selectedValueIds}
      />
    </>
  );
}