import type { Category } from "./category";
import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

interface Banner {
  banner: string;
}

interface GetProductBannerRes {
  total: number;
  list: Array<Banner>;
}

export const getProductBanner = () =>
  api.get("product/banner").json<CommonRes<GetProductBannerRes>>();

interface GetProductCategoryReq extends PublicLanguageCode {
  categoryId: number;
}

interface GetProductCategoryRes {
  total: number;
  list: Array<Category>;
}

export const getProductCategory = ({
  categoryId,
  languageCode,
}: GetProductCategoryReq) =>
  api
    .get("product/category", {
      searchParams: {
        categoryId,
        languageCode,
      },
    })
    .json<CommonRes<GetProductCategoryRes>>();

interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  search?: string;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  sortColumn?: string; // creatDate, price
  sort?: string; // ASC, DESC
}

interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  price: number;
  like: number;
  review: number;
  reviewAverage: number;
  image: string;
}

interface GetProductListRes {
  total: number;
  list: Array<ProductItem>;
}

export const getProductList = (req: GetProductListReq) =>
  api
    .get("product", {
      searchParams: {
        ...req,
      },
    })
    .json<CommonRes<GetProductListRes>>();

interface GetProductDetailReq extends PublicLanguageCode {
  id: number;
}

interface GetProductDetailRes {
  like: number;
  review: number;
  reviewAverage: number;
}

export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api
    .get(`product`, {
      searchParams: {
        id,
        languageCode,
      },
    })
    .json<CommonRes<GetProductDetailRes>>();
