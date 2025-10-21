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

export interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  search?: string;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  sortColumn?: string; // creatDate, price
  sort?: string; // ASC, DESC
}

export interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  price: number;
  like: number;
  review: number;
  reviewAverage: number;
  image: string;
}

export interface GetProductListRes {
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

interface OptionValue {
  id: number;
  value: string;
}

type OptionType = "COLOR" | "SIZE" | "MATERIAL" | "FIT" | "STYLE";

type DetailOption = Record<OptionType, OptionValue[]>;

interface GetProductDetailRes {
  id: number;
  name: string;
  brand: Record<"name" | "profileImage", string>;
  price: number;
  discountPrice: number;
  origin: string;
  shippingInfo: number;
  shippingCost: number;
  option: Array<DetailOption>;
  like: number;
  review: number;
  reviewAverage: number;
  detailImg: string;
  subImage: string[];
  relate: ProductItem[];
}

export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api
    .get(`product/${id}`, {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetProductDetailRes>>();

export interface GetProductBrandBannerReq extends PublicLanguageCode {
  brandId: number;
}

export interface GetProductBrandBannerRes {
  brandId: number;
  banner: string;
  name: string;
  englishName: string;
  description: string;
  like: number;
}

export const getProductBrandBanner = ({
  brandId,
  languageCode,
}: GetProductBrandBannerReq) =>
  api
    .get(`product/banner/brand`, {
      searchParams: {
        brandId,
        languageCode,
      },
    })
    .json<CommonRes<GetProductBrandBannerRes>>();
