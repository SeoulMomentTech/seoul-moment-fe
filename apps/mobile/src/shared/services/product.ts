import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  price: number;
  like: number;
  review: number;
  reviewAverage: number;
  image: string;
  colorName: string;
  colorCode: string;
  isLiked: boolean;
}

export interface GetProductListRes {
  total: number;
  list: ProductItem[];
}

interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  mainView?: boolean;
}

/**
 * @description 상품 목록. 엔드포인트는 "product" 다 — "product/list" 는 400 을 준다.
 */
export const getProductList = ({
  languageCode,
  page,
  count,
  mainView,
}: GetProductListReq) =>
  api
    .get("product", {
      searchParams: {
        languageCode,
        page,
        count,
        ...(mainView == null ? {} : { mainView }),
      },
    })
    .json<CommonRes<GetProductListRes>>();
