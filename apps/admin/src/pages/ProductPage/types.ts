export interface OptionValueBadge {
  id: number;
  label: string;
  colorCode?: string | null;
}

export interface VariantForm {
  sku: string;
  stockQuantity: string;
  optionValueIds: string;
  optionValueBadgeList?: OptionValueBadge[];
}

export interface ProductFormValues {
  productId: string;
  price: string;
  discountPrice: string;
  shippingCost: string;
  shippingInfo: string;
  imageUrlList: string[];
  variants: VariantForm[];
}
