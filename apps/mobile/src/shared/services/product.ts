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

export interface ProductBrandBanner {
  brandId: number;
  banner: string;
  name: string;
  englishName: string;
  /** 평문이다 — 태그 없이 \n 만 들어 있어 Text 에 그대로 넣는다. */
  description: string;
  like: number;
  isLiked: boolean;
}

/**
 * @description 브랜드로 좁힌 상품 목록 맨 위에 쓰는 브랜드 소개. 배너·이름·설명·좋아요 수가
 * 한 번에 온다. name/description 은 Accept-language 를 따르고 englishName 은 따르지 않는다.
 * 브랜드 목록에 있는 id 라도 404 가 올 수 있으므로(dev 의 1번) 호출부가 실패를 정상 분기로 다뤄야 한다.
 */
export const getProductBrandBanner = ({
  brandId,
  languageCode,
}: PublicLanguageCode & { brandId: number }) =>
  api
    .get("product/banner/brand", { searchParams: { brandId, languageCode } })
    .json<CommonRes<ProductBrandBanner>>();

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

/**
 * 살 수 있는 조합 하나(SKU). option 은 축별로 어떤 값이 있는지만 말하고,
 * 그중 실제로 존재하는 조합은 여기에만 있다 — 담을 때 서버가 요구하는 id 도 이것이다.
 */
export interface ProductVariant {
  id: number;
  sku: string;
  /** 이 조합을 이루는 옵션값 id. option 안의 값 id 와 맞춰 이름을 찾는다. */
  optionValueIds: number[];
  stockQuantity: number;
  isSoldOut: boolean;
}

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
  option: ProductDetailOption;
  variants: ProductVariant[];
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

/**
 * 상품 상세. 웹과 같은 `product/v1/{id}` 를 쓴다.
 *
 * v0(`product/{id}`) 과의 차이는 두 칸뿐인데, 둘 다 한쪽에만 있다 —
 * v1 은 `variants`(조합·재고)를 주고 `shippingCost` 를 뺀다. 담으려면 조합 id 가 반드시
 * 필요하고 배송비는 주문서에서 확정되므로 v1 을 고른다. 웹도 같은 이유로 v1 만 쓴다.
 */
export const getProductDetail = ({ id, languageCode }: GetProductDetailReq) =>
  api
    .get(`product/v1/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<GetProductDetailRes>>();
