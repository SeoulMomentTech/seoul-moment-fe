export interface OptionValueBadge {
  id: number;
  label: string;
  colorCode?: string | null;
}

export interface VariantForm {
  sku: string;
  stockQuantity: string;
  /**
   * @description 옵션 값 ID들을 쉼표로 구분한 문자열 (Form 입력용)
   * 예: "1, 2, 3"
   */
  optionValueIds: string;
  /**
   * @description 옵션 값 뱃지 표시를 위한 객체 리스트 (UI 표시용)
   */
  optionValueBadgeList?: OptionValueBadge[];
}

export interface ProductFormValues {
  productId: string;
  price: string;
  discountPrice: string;
  shippingCost: string;
  shippingInfo: string;
  mainImageFile: File | null;
  mainImagePreview: string;
  imageUrlList: string[];
  variants: VariantForm[];
}
