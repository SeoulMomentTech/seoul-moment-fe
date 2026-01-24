import { useState, type ChangeEvent } from "react";

import { useNavigate } from "react-router";



import { PATH } from "@shared/constants/route";
import type { ProductOptionId } from "@shared/services/productOption";
import type { CreateAdminProductItemRequest } from "@shared/services/products";
import { stripImageDomain, uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import { Button } from "@seoul-moment/ui";

import { OptionValueModal } from "../../components/OptionValueModal";
import { ProductBasicInfoSection } from "../../components/ProductBasicInfoSection";
import { ProductImageSection } from "../../components/ProductImageSection";
import { ShippingInfoSection } from "../../components/ShippingInfoSection";
import { VariantSection } from "../../components/VariantSection";
import { useCreateAdminProductItemMutation } from "../../hooks";
import type { OptionValueBadge, ProductFormValues, VariantForm } from "../../types";
import {
  createEmptyVariant,
  createInitialValues,
  parseOptionValueIds,
  validateProductForm,
} from "../../utils";

export default function ProductAddForm() {
  const navigate = useNavigate();
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    null,
  );
  const [selectedOptionId, setSelectedOptionId] =
    useState<ProductOptionId | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<number[]>([]);

  const { mutateAsync: createProductItem, isPending } =
    useCreateAdminProductItemMutation({
      onSuccess: () => navigate(PATH.PRODUCTS),
    });

  const formik = useFormik<ProductFormValues>({
    initialValues: createInitialValues(),
    validateOnBlur: false,
    validateOnChange: false,
    validate: validateProductForm,
    onSubmit: async (values) => {
      // mainImageFile이 없어도 mainImagePreview가 있으면 통과되지만,
      // Add 모드에서는 mainImageFile이 필수이므로 validateProductForm이 잡아줌.
      // (단, createInitialValues에서 preview가 ""이므로)

      if (!values.mainImageFile) {
        // 이론상 validate에서 걸러지므로 여기에 도달하지 않음
        return;
      }

      try {
        const { imagePath } = await uploadImageFile(
          values.mainImageFile,
          "product",
        );

        const payload: CreateAdminProductItemRequest = {
          productId: Number(values.productId),
          mainImageUrl: stripImageDomain(imagePath),
          price: Number(values.price),
          discountPrice: values.discountPrice
            ? Number(values.discountPrice)
            : undefined,
          shippingCost: Number(values.shippingCost),
          shippingInfo: Number(values.shippingInfo),
          imageUrlList: values.imageUrlList.length
            ? values.imageUrlList.map(stripImageDomain)
            : undefined,
          variantList: values.variants.map((variant) => ({
            sku: variant.sku.trim(),
            stockQuantity: Number(variant.stockQuantity),
            optionValueList: parseOptionValueIds(variant.optionValueIds),
          })),
        };

        await createProductItem(payload);
      } catch (error) {
        console.error("상품 아이템 등록 오류:", error);
        alert("상품 아이템을 등록하는 중 오류가 발생했습니다.");
      }
    },
  });

  const handleAddVariant = () =>
    formik.setFieldValue("variants", [
      ...formik.values.variants,
      createEmptyVariant(),
    ]);

  const handleRemoveVariant = (index: number) =>
    formik.setFieldValue(
      "variants",
      formik.values.variants.filter((_, idx) => idx !== index),
    );

  const handleVariantChange = (
    index: number,
    field: keyof VariantForm,
    value: VariantForm[keyof VariantForm],
  ) => {
    formik.setFieldValue(
      "variants",
      formik.values.variants.map((variant, idx) =>
        idx === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const handleVariantUpdate = (index: number, nextVariant: VariantForm) => {
    formik.setFieldValue(
      "variants",
      formik.values.variants.map((variant, idx) =>
        idx === index ? nextVariant : variant,
      ),
    );
  };

  const handleOpenOptionModal = (index: number) => {
    setActiveVariantIndex(index);
    setSelectedOptionId(null);
    setSelectedValueIds(
      parseOptionValueIds(formik.values.variants[index]?.optionValueIds ?? ""),
    );
    setIsOptionModalOpen(true);
  };

  const handleCloseOptionModal = () => {
    setIsOptionModalOpen(false);
    setActiveVariantIndex(null);
    setSelectedOptionId(null);
    setSelectedValueIds([]);
  };

  const handleConfirmOptionValues = (badges: OptionValueBadge[]) => {
    if (!selectedOptionId) {
      alert("옵션을 선택해주세요.");
      return;
    }

    if (selectedValueIds.length === 0) {
      alert("옵션 값을 선택해주세요.");
      return;
    }

    if (activeVariantIndex === null) {
      handleCloseOptionModal();
      return;
    }

    formik.setFieldValue(
      "variants",
      formik.values.variants.map((variant, index) => {
        if (index !== activeVariantIndex) {
          return variant;
        }

        const mergedValueIds = Array.from(
          new Set([
            ...parseOptionValueIds(variant.optionValueIds),
            ...selectedValueIds,
          ]),
        );
        const mergedBadges = [
          ...(variant.optionValueBadgeList ?? []),
          ...badges,
        ].reduce<OptionValueBadge[]>((acc, badge) => {
          if (acc.some((item) => item.id === badge.id)) {
            return acc;
          }
          acc.push(badge);
          return acc;
        }, []);

        return {
          ...variant,
          optionValueIds: mergedValueIds.join(", "),
          optionValueBadgeList: mergedBadges,
        };
      }),
    );
    handleCloseOptionModal();
  };

  const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    formik.setFieldValue("mainImageFile", file);
    formik.setFieldValue("mainImagePreview", URL.createObjectURL(file));
  };

  const handleMainImageClear = () => {
    formik.setFieldValue("mainImageFile", null);
    formik.setFieldValue("mainImagePreview", "");
  };

  return (
    <>
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <ProductBasicInfoSection formik={formik} isPending={isPending} />
        <ShippingInfoSection formik={formik} isPending={isPending} />
        <div className="space-y-1">
          <ProductImageSection
            imageUrlList={formik.values.imageUrlList}
            mainImagePreview={formik.values.mainImagePreview}
            onImageUrlListChange={(urls) =>
              formik.setFieldValue("imageUrlList", urls)
            }
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
        onSelectOption={(optionId) => {
          setSelectedOptionId(optionId);
          setSelectedValueIds([]);
        }}
        onToggleValue={(valueId) => {
          setSelectedValueIds((prev) =>
            prev.includes(valueId)
              ? prev.filter((item) => item !== valueId)
              : [...prev, valueId],
          );
        }}
        selectedOptionId={selectedOptionId}
        selectedValueIds={selectedValueIds}
      />
    </>
  );
}
