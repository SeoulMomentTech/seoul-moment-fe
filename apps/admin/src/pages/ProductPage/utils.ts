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

/**
 * 기존 변형을 SKU·재고·옵션 조합까지 그대로 복사한다.
 */
export const duplicateVariant = (variant: VariantForm): VariantForm => ({
  ...variant,
  optionValueBadgeList: [...(variant.optionValueBadgeList ?? [])],
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
 * getKey가 같은 값을 돌려주는 첫 번째 변형 묶음의 번호(1부터)를 찾는다.
 * getKey가 null이면 비교에서 제외한다(빈 값은 필수값 검증에서 따로 잡는다).
 */
const findDuplicateNumbers = (
  variants: VariantForm[],
  getKey: (variant: VariantForm) => string | null,
) => {
  const numbersByKey = new Map<string, number[]>();

  variants.forEach((variant, index) => {
    const key = getKey(variant);
    if (key === null) {
      return;
    }

    numbersByKey.set(key, [...(numbersByKey.get(key) ?? []), index + 1]);
  });

  return [...numbersByKey.values()].find((numbers) => numbers.length > 1);
};

/**
 * SKU가 같은 변형들의 번호를 찾는다. 앞뒤 공백은 무시한다.
 */
export const findDuplicateSkuNumbers = (variants: VariantForm[]) =>
  findDuplicateNumbers(variants, (variant) => variant.sku.trim() || null);

/**
 * 옵션 값 조합이 같은 변형들의 번호를 찾는다. 옵션 값 순서는 무시한다.
 */
export const findDuplicateOptionNumbers = (variants: VariantForm[]) =>
  findDuplicateNumbers(variants, (variant) => {
    const ids = parseOptionValueIds(variant.optionValueIds);
    return ids.length > 0
      ? [...new Set(ids)].sort((a, b) => a - b).join(",")
      : null;
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

const formatVariantNumbers = (numbers: number[]) =>
  numbers.map((number) => `변형 #${number}`).join(", ");

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

    const duplicateSkuNumbers = findDuplicateSkuNumbers(values.variants);
    const duplicateOptionNumbers = findDuplicateOptionNumbers(values.variants);

    if (invalidVariantIndex !== -1) {
      errors.variants = "옵션(재고) 정보를 모두 입력해주세요.";
    } else if (duplicateSkuNumbers) {
      errors.variants = `SKU가 같은 변형이 있습니다. (${formatVariantNumbers(duplicateSkuNumbers)})`;
    } else if (duplicateOptionNumbers) {
      errors.variants = `옵션 값 조합이 같은 변형이 있습니다. (${formatVariantNumbers(duplicateOptionNumbers)})`;
    }
  }

  return errors;
};
