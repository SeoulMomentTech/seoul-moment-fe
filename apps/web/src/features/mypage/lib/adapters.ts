import type { ProductItem } from "@shared/services/product";
import type { UserRecentProduct } from "@shared/services/userRecent";

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
