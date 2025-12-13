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
  categoryId?: number;
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
  optionIdList?: number[];
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
  colorName: string;
  colorCode: string;
}

export interface GetProductListRes {
  total: number;
  list: Array<ProductItem>;
}

export const getProductList = ({
  optionIdList,
  ...params
}: GetProductListReq) => {
  const searchParams: Array<Array<string | number | boolean>> = Object.entries(
    params,
  ).reduce<Array<Array<string | number | boolean>>>(
    (acc, [key, value]) =>
      value === undefined || value === null ? acc : [...acc, [key, value]],
    [],
  );

  if (Array.isArray(optionIdList)) {
    optionIdList.forEach((id) => {
      searchParams.push(["optionIdList", id]);
    });
  }

  return api
    .get("product", {
      searchParams,
    })
    .json<CommonRes<GetProductListRes>>();
};

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

export type SortOption = Category & {
  sortColumn: string;
  sort: "ASC" | "DESC";
};

interface GetProductSortFilterRes {
  total: number;
  list: Array<SortOption>;
}

export const getProductSortFilter = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("product/sort/filter", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetProductSortFilterRes>>();

interface Option {
  id: number;
  type: string;
}

interface GetProductOptionsRes {
  total: number;
  list: Array<Option>;
}

// 상품 옵션 리스트
export const getProductOptions = () =>
  api.get("product/option").json<CommonRes<GetProductOptionsRes>>();

interface GetProductOptionValueReq extends PublicLanguageCode {
  optionId: number;
}

interface OptionValue {
  id: number;
  value: string;
}

interface GetProductOptionValuRes {
  total: number;
  list: Array<OptionValue>;
}

// 상품 옵션 값 리스트
export const getProdctionOptionValue = ({
  optionId,
  languageCode,
}: GetProductOptionValueReq) =>
  api
    .get("product/option/value", {
      searchParams: {
        optionId,
        languageCode,
      },
    })
    .json<CommonRes<GetProductOptionValuRes>>();

export interface ProductFilter {
  title: string;
  optionValueList: Array<ProductFilterOptionValue>;
}

export interface GridOptionInfo extends ProductFilter {
  type: "grid";
}

export interface RadioOptionInfo extends ProductFilter {
  type: "radio";
}

export type OptionInfo = GridOptionInfo | RadioOptionInfo;

interface ProductFilterOptionValue {
  optionId: number;
  value: string;
  colorCode?: string;
}

interface GetProductFilterReq extends PublicLanguageCode {
  categoryId: number;
  brandId?: number;
  productCategoryId?: number;
}

interface GetProductFilterRes {
  total: number;
  list: Array<ProductFilter>;
}

export const getProductFilter = ({
  categoryId,
  brandId,
  productCategoryId,
  languageCode,
}: GetProductFilterReq) =>
  api
    .get("product/filter", {
      searchParams: {
        categoryId,
        brandId,
        productCategoryId,
        languageCode,
      },
    })
    .json<CommonRes<GetProductFilterRes>>();
