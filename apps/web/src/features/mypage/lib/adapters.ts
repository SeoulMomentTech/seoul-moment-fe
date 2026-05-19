import type { ProductItem } from "@shared/services/product";
import type { GetUserFitRes, UpdateUserFitReq } from "@shared/services/user";
import type { UserRecentProduct } from "@shared/services/userRecent";

import type { SizeType } from "./sizeOptions";

export interface CustomInfoFormValues {
  height: string;
  weight: string;
  sizeValues: Partial<Record<SizeType, string>>;
}

export function fitToFormValues(fit: GetUserFitRes): CustomInfoFormValues {
  return {
    height: fit.height == null ? "" : String(fit.height),
    weight: fit.weight == null ? "" : String(fit.weight),
    sizeValues: {
      shoes: fit.shoeSize == null ? "" : String(fit.shoeSize),
      outer: fit.outerSize ?? "",
      top: fit.topSize ?? "",
      bottom: fit.bottomSize ?? "",
    },
  };
}

export function formValuesToFitPayload(
  values: CustomInfoFormValues,
): UpdateUserFitReq {
  const { bottom, outer, shoes, top } = values.sizeValues;

  return {
    height: values.height.trim() === "" ? null : Number(values.height),
    weight: values.weight.trim() === "" ? null : Number(values.weight),
    shoeSize: shoes ? Number(shoes) : null,
    outerSize: outer || null,
    topSize: top || null,
    bottomSize: bottom || null,
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
