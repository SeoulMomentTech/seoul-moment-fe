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
  mainImageFile: null,
  mainImagePreview: "",
  imageUrlList: [],
  variants: [createEmptyVariant()],
});

/**
 * Parse a comma-separated string of option value IDs into an array of positive integers.
 * 
 * Rules:
 * - Returns only finite, positive integers (value > 0).
 * - Filters out 0 (invalid by business rule).
 * - Filters out negative numbers.
 * - Filters out non-numeric values (NaN).
 * - Filters out floating point numbers (IDs must be integers).
 * 
 * @param raw - Comma-separated string of IDs (e.g., "1, 2, 3")
 * @returns Array of valid positive integers
 */
export const parseOptionValueIds = (raw: string) =>
  raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);

export const getOptionLabel = (nameDto?: AdminProductOptionName[]) =>
  nameDto?.find((name) => name.languageCode === "ko")?.name ??
  nameDto?.[0]?.name ??
  "-";

export const getOptionValueLabel = (nameDto?: AdminProductOptionValueName[]) =>
  nameDto?.find((name) => name.languageCode === "ko")?.value ??
  nameDto?.[0]?.value ??
  "-";

export const validateProductForm = (values: ProductFormValues) => {
  const errors: Record<string, string> = {};

  if (!values.productId || Number.isNaN(Number(values.productId))) {
    errors.productId = "상품 ID를 숫자로 입력해주세요.";
  }

  if (!values.mainImageFile && !values.mainImagePreview) {
    errors.mainImageFile = "대표 이미지를 업로드해주세요.";
  }

  if (!values.price || Number.isNaN(Number(values.price))) {
    errors.price = "가격을 입력해주세요.";
  }

  if (!values.shippingCost || Number.isNaN(Number(values.shippingCost))) {
    errors.shippingCost = "배송비를 입력해주세요.";
  }

  if (!values.shippingInfo || Number.isNaN(Number(values.shippingInfo))) {
    errors.shippingInfo = "배송 정보를 입력해주세요.";
  }

  if (values.variants.length === 0) {
    errors.variants = "옵션(재고) 정보를 최소 1개 이상 입력해주세요.";
  } else {
    const invalidVariantIndex = values.variants.findIndex(
      (variant) =>
        !variant.sku.trim() ||
        !variant.stockQuantity.trim() ||
        Number.isNaN(Number(variant.stockQuantity)) ||
        parseOptionValueIds(variant.optionValueIds).length === 0,
    );

    if (invalidVariantIndex !== -1) {
      errors.variants = "옵션(재고) 정보를 모두 입력해주세요.";
    }
  }

  return errors;
};
