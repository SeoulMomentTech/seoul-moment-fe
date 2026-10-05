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

export interface GetProductCategoryReq extends PublicLanguageCode {
  /** 최상위 카테고리로 좁힌다. 없으면 전체 상품 카테고리를 준다. */
  categoryId?: number;
}

/**
 * @description 상품 카테고리(후드/집업, 니트 …). 여기 id 는 `productCategoryId` 이지
 * `categoryId` 가 아니다 — product 목록에 categoryId 로 넘기면 항상 0건이 온다.
 */
export const getProductCategory = ({
  languageCode,
  categoryId,
}: GetProductCategoryReq) =>
  api
    .get("product/category", {
      searchParams:
        categoryId == null ? { languageCode } : { languageCode, categoryId },
    })
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

export interface ProductDetailBrand {
  id: number;
  name: string;
  profileImg: string;
}

export interface ProductOptionValue {
  id: number;
  value: string;
}

/** 옵션 타입(COLOR, SIZE …)을 키로 한 객체. 상품이 가진 타입만 내려온다. */
export type ProductDetailOption = Partial<Record<string, ProductOptionValue[]>>;

export interface ProductExternal {
  id: number;
  name: string;
  imageUrl: string;
  url: string;
}

export interface GetProductDetailRes {
  id: number;
  name: string;
  brand: ProductDetailBrand;
  price: number;
  /** 0 이면 할인 없음. */
  discountPrice: number;
  origin: string;
  /** 출고까지 걸리는 일수. 0 이하면 표시하지 않는다. */
  shippingInfo: number;
  shippingCost: number;
  option: ProductDetailOption;
  like: number;
  review: number;
  reviewAverage: number;
  /** 세로로 긴 상세 이미지 한 장의 URL (배열이 아니라 문자열). */
  detailImg: string;
  subImage: string[];
  relate: ProductItem[];
  external: ProductExternal[];
  isLiked: boolean;
}

export interface GetProductDetailReq extends PublicLanguageCode {
  id: number;
}

/** 상품 상세. 엔드포인트는 `product/{id}` (웹의 v1 은 쓰지 않는다). */
export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api
    .get(`product/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<GetProductDetailRes>>();
