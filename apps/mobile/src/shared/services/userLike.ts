import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/**
 * 관심 상품·브랜드. web 의 userLike 와 같은 응답이지만 읽기와 해제만 적는다 —
 * 앱에는 아직 좋아요를 "거는" 자리가 없다(상품 상세의 isLiked 는 읽기 전용).
 *
 * searchParams 의 undefined 는 ky 가 걸러내므로(normalizeSearchParams) 그대로 넘긴다.
 * languageCode 만은 반드시 붙어야 한다 — beforeRequest 가 이 값을 Accept-language 헤더로
 * 옮기고 쿼리에서 지운다. 진짜 쿼리 파라미터로 보내면 서버가 400 을 준다.
 */
export interface GetUserProductLikeListReq extends PublicLanguageCode {
  page?: number;
  count?: number;
  search?: string;
  sort?: "ASC" | "DESC";
  /** product/category 의 id 다 — categoryId 가 아니다. */
  productCategoryId?: number;
}

export interface UserProductLike {
  productItemId: number;
  brandName: string;
  productName: string;
  imageUrl: string;
  price: number;
  /** 없거나 0 이면 할인이 없다. */
  discountPrice?: number;
}

export interface GetUserProductLikeListRes {
  total: number;
  list: UserProductLike[];
}

/**
 * @description 관심 상품 목록 (access_token 필요)
 */
export const getUserProductLikeList = ({
  page,
  count,
  search,
  sort,
  productCategoryId,
  languageCode,
}: GetUserProductLikeListReq) =>
  api
    .get("user/like/product", {
      searchParams: {
        page,
        count,
        search,
        sort,
        productCategoryId,
        languageCode,
      },
    })
    .json<CommonRes<GetUserProductLikeListRes>>();

/**
 * @description 관심 상품 해제. 본문 없이 204 만 오므로 .json() 을 부르지 않는다.
 */
export const deleteUserProductLike = (productItemId: number) =>
  api.delete(`user/like/product/${productItemId}`);

export interface GetUserBrandLikeListReq extends PublicLanguageCode {
  page?: number;
  count?: number;
  search?: string;
  sort?: "ASC" | "DESC";
}

export interface UserBrandLikeProduct {
  productItemId: number;
  productName: string;
  imageUrl: string;
  price: number;
}

export interface UserBrandLike {
  brandId: number;
  englishBrandName: string;
  brandName: string;
  totalLikeCount: number;
  /** 브랜드의 최근 상품. 지금 화면은 쓰지 않지만 응답에 늘 들어 있다. */
  recentProductList: UserBrandLikeProduct[];
}

export interface GetUserBrandLikeListRes {
  total: number;
  list: UserBrandLike[];
}

/**
 * @description 관심 브랜드 목록 (access_token 필요)
 */
export const getUserBrandLikeList = ({
  page,
  count,
  search,
  sort,
  languageCode,
}: GetUserBrandLikeListReq) =>
  api
    .get("user/like/brand", {
      searchParams: { page, count, search, sort, languageCode },
    })
    .json<CommonRes<GetUserBrandLikeListRes>>();

/**
 * @description 관심 브랜드 해제. 상품 해제와 같이 본문이 없다.
 */
export const deleteUserBrandLike = (brandId: number) =>
  api.delete(`user/like/brand/${brandId}`);
