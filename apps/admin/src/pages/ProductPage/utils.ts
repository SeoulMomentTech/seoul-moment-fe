import type {
  AdminProductOptionName,
  AdminProductOptionValueName,
} from "@shared/services/productOption";

import type { ProductFormValues, VariantForm } from "./types";

export const createEmptyVariant = (): VariantForm => ({
  sku: "",
  stockQuantity: "",
  optionValueIds: "",
  optionValueBadgeList: [],
});

export const createInitialValues = (): ProductFormValues => ({
  productId: "",
  price: "",
  discountPrice: "",
  shippingCost: "",
  shippingInfo: "",
  imageUrlList: [],
  variants: [createEmptyVariant()],
});

export const parseOptionValueIds = (raw: string) =>
  raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

export const getOptionLabel = (nameDto?: AdminProductOptionName[]) =>
  nameDto?.find((name) => name.languageCode === "ko")?.name ??
  nameDto?.[0]?.name ??
  "-";

export const getOptionValueLabel = (nameDto?: AdminProductOptionValueName[]) =>
  nameDto?.find((name) => name.languageCode === "ko")?.value ??
  nameDto?.[0]?.value ??
  "-";

export const validateProductForm = (
  values: ProductFormValues,
  mainImageFile: File | null,
) => {
  if (!values.productId || Number.isNaN(Number(values.productId))) {
    return "상품 ID를 숫자로 입력해주세요.";
  }

  if (!mainImageFile) {
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
