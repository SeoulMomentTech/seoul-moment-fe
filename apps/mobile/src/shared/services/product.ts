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

export interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  search?: string;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  optionIdList?: number[];
  sortColumn?: string; // createDate, price
  sort?: string; // ASC, DESC
  mainView?: boolean;
}

type SearchParamPair = [string, string | number | boolean];

/**
 * @description 상품 목록. 엔드포인트는 "product" 다 — "product/list" 는 400 을 준다.
 * optionIdList 는 `optionIdList=1&optionIdList=2` 처럼 키가 반복돼야 해서 객체가 아니라
 * 쌍의 배열로 searchParams 를 만든다. 객체로 넘기면 배열이 한 값으로 뭉개진다.
 */
export const getProductList = ({
  optionIdList,
  ...params
}: GetProductListReq) => {
  const searchParams = Object.entries(params).reduce<SearchParamPair[]>(
    (acc, [key, value]) =>
      value === undefined || value === null ? acc : [...acc, [key, value]],
    [],
  );

  optionIdList?.forEach((id) => {
    searchParams.push(["optionIdList", id]);
  });

  return api
    .get("product", { searchParams })
    .json<CommonRes<GetProductListRes>>();
};

export interface ProductBanner {
  banner: string;
  mobileBanner: string | null;
  url: string;
}

export interface GetProductBannerRes {
  total: number;
  list: ProductBanner[];
}

export const getProductBanner = () =>
  api.get("product/banner").json<CommonRes<GetProductBannerRes>>();

export interface ProductCategory {
  id: number;
  image: string;
  name: string;
}

export interface GetProductCategoryRes {
  total: number;
  list: ProductCategory[];
}

export const getProductCategory = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("product/category", { searchParams: { languageCode } })
    .json<CommonRes<GetProductCategoryRes>>();

export interface ProductSortOption {
  id: number;
  name: string;
  sortColumn: string;
  sort: "ASC" | "DESC";
}

export interface GetProductSortFilterRes {
  total: number;
  list: ProductSortOption[];
}

export const getProductSortFilter = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("product/sort/filter", { searchParams: { languageCode } })
    .json<CommonRes<GetProductSortFilterRes>>();

export interface ProductFilterOptionValue {
  optionId: number;
  value: string;
  colorCode?: string | null;
}

export interface ProductOptionFilter {
  title: string;
  type: "RADIO" | "GRID";
  optionValueList: ProductFilterOptionValue[];
}

/** categoryId 는 필수 — 없으면 API 가 validation 에러를 준다. */
export interface GetProductFilterReq extends PublicLanguageCode {
  categoryId: number;
  brandId?: number;
  productCategoryId?: number;
}

export interface GetProductFilterRes {
  total: number;
  list: ProductOptionFilter[];
}

export const getProductFilter = ({
  languageCode,
  categoryId,
  brandId,
  productCategoryId,
}: GetProductFilterReq) =>
  api
    .get("product/filter", {
      searchParams: {
        languageCode,
        categoryId,
        ...(brandId == null ? {} : { brandId }),
        ...(productCategoryId == null ? {} : { productCategoryId }),
      },
    })
    .json<CommonRes<GetProductFilterRes>>();
