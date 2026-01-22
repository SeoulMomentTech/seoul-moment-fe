import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useNavigate } from "react-router";

import { PATH } from "@shared/constants/route";
import type { ProductOptionId } from "@shared/services/productOption";
import type {
  AdminProductItemDetail,
  AdminProductItemId,
  UpdateAdminProductItemRequest,
} from "@shared/services/products";
import { stripImageDomain, uploadImageFile } from "@shared/utils/image";
import { useFormik } from "formik";

import { Button } from "@seoul-moment/ui";

import { OptionValueModal } from "../../AddPage/components/OptionValueModal";
import { ProductBasicInfoSection } from "../../AddPage/components/ProductBasicInfoSection";
import { ProductImageSection } from "../../AddPage/components/ProductImageSection";
import { ShippingInfoSection } from "../../AddPage/components/ShippingInfoSection";
import { VariantSection } from "../../AddPage/components/VariantSection";
import type {
  OptionValueBadge,
  ProductFormValues,
  VariantForm,
} from "../../AddPage/types";
import {
  createEmptyVariant,
  parseOptionValueIds,
} from "../../AddPage/utils";
import {
  useAdminProductItemDetailQuery,
  useUpdateAdminProductItemMutation,
} from "../../hooks";

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

const validateEditProductForm = (
  values: ProductFormValues,
  hasMainImage: boolean,
) => {
  if (!values.productId || Number.isNaN(Number(values.productId))) {
    return "상품 ID를 숫자로 입력해주세요.";
  }

  if (!hasMainImage) {
    return "대표 이미지를 업로드해주세요.";
  }

  if (!values.price || Number.isNaN(Number(values.price))) {
    return "가격을 입력해주세요.";
  }

  if (!values.shippingCost || Number.isNaN(Number(values.shippingCost))) {
    return "배송비를 입력해주세요.";
  }

  if (!values.shippingInfo || Number.isNaN(Number(values.shippingInfo))) {
    return "배송 정보를 입력해주세요.";
  }

  if (values.variants.length === 0) {
    return "옵션(재고) 정보를 최소 1개 이상 입력해주세요.";
  }

  const invalidVariant = values.variants.find(
    (variant) =>
      !variant.sku.trim() ||
      !variant.stockQuantity.trim() ||
      Number.isNaN(Number(variant.stockQuantity)) ||
      parseOptionValueIds(variant.optionValueIds).length === 0,
  );

  if (invalidVariant) {
    return "옵션(재고) 정보를 모두 입력해주세요.";
  }

  return null;
};

export default function ProductEditForm({
  productItemId,
}: ProductEditFormProps) {
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [existingMainImageUrl, setExistingMainImageUrl] = useState("");
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    null,
  );
  const [selectedOptionId, setSelectedOptionId] =
    useState<ProductOptionId | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<number[]>([]);

  const { data: detailResponse, isLoading } =
    useAdminProductItemDetailQuery(productItemId);
  const detail = detailResponse?.data;

  const { mutateAsync: updateProductItem, isPending } =
    useUpdateAdminProductItemMutation({
      onSuccess: () => navigate(PATH.PRODUCTS),
    });

  const formik = useFormik<ProductFormValues>({
    initialValues: {
      productId: "",
      price: "",
      discountPrice: "",
      shippingCost: "",
      shippingInfo: "",
      imageUrlList: [],
      variants: [createEmptyVariant()],
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      const validationError = validateEditProductForm(
        values,
        Boolean(mainImageFile || mainImagePreview),
      );
      if (validationError) {
        alert(validationError);
        return;
      }

      try {
        const mainImageUrl =
          mainImageFile !== null
            ? (await uploadImageFile(mainImageFile, "product")).imagePath
            : stripImageDomain(existingMainImageUrl);

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

  useEffect(() => {
    if (!detail || initializedRef.current) {
      return;
    }

    const nextValues = buildInitialValues(detail);
    setValues(nextValues, true);
    setMainImagePreview(detail.mainImageUrl ?? "");
    setExistingMainImageUrl(detail.mainImageUrl ?? "");
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

    setFieldValue(
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
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleMainImageClear = () => {
    setMainImageFile(null);
    setMainImagePreview("");
    setExistingMainImageUrl("");
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
        <ProductImageSection
          imageUrlList={formik.values.imageUrlList}
          mainImagePreview={mainImagePreview}
          onImageUrlListChange={(urls) => setFieldValue("imageUrlList", urls)}
          onMainImageChange={handleMainImageChange}
          onMainImageClear={handleMainImageClear}
        />
        <VariantSection
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
