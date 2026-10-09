import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/**
 * 최근 본 상품. 관심 상품과 달리 해제가 없다 — 목록을 지우는 API 가 없고,
 * 화면에서도 "지난 자취"로만 읽힌다.
 */
export interface UserRecentProduct {
  productItemId: number;
  brandId: number;
  productName: string;
  brandName: string;
  imageUrl: string;
  price: number;
  /** 없거나 0 이면 할인이 없다. */
  discountPrice?: number;
  like: number;
  review: number;
  reviewAverage: number;
}

export interface GetUserRecentListReq extends PublicLanguageCode {
  page?: number;
  count?: number;
  search?: string;
  sort?: "ASC" | "DESC";
}

export interface GetUserRecentListRes {
  total: number;
  list: UserRecentProduct[];
}

/**
 * @description 최근 본 상품 목록 (access_token 필요)
 */
export const getUserRecentList = ({
  page,
  count,
  search,
  sort,
  languageCode,
}: GetUserRecentListReq) =>
  api
    .get("user/recent", {
      searchParams: { page, count, search, sort, languageCode },
    })
    .json<CommonRes<GetUserRecentListRes>>();
