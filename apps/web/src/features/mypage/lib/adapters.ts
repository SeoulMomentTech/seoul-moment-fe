import type { ProductItem } from "@shared/services/product";
import type { UserFit } from "@shared/services/user";
import type { UserRecentProduct } from "@shared/services/userRecent";

import type { SizeType } from "./sizeOptions";

export interface CustomInfoFormValues {
  height: string;
  weight: string;
  sizeValues: Partial<Record<SizeType, string>>;
}

export function fitToFormValues(fit: UserFit): CustomInfoFormValues {
  return {
    height: String(fit.height),
    weight: String(fit.weight),
    sizeValues: {
      shoes: String(fit.shoeSize),
      outer: fit.outerSize,
      top: fit.topSize,
      bottom: fit.bottomSize,
    },
  };
}

export function formValuesToFitPayload(values: CustomInfoFormValues): UserFit {
  return {
    height: Number(values.height),
    weight: Number(values.weight),
    shoeSize: Number(values.sizeValues.shoes ?? 0),
    outerSize: values.sizeValues.outer ?? "",
    topSize: values.sizeValues.top ?? "",
    bottomSize: values.sizeValues.bottom ?? "",
  };
}

export function toProductItem(p: UserRecentProduct): ProductItem {
  return {
    id: p.productItemId,
    brandName: p.brandName,
    productName: p.productName,
    price: p.price,
    like: p.like,
    review: p.review,
    reviewAverage: p.reviewAverage,
    image: p.imageUrl,
    colorName: "",
    colorCode: "",
  };
}
