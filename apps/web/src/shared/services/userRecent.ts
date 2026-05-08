import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

interface CreateUserRecentReq {
  productItemId: number;
}

/**
 * @description 유저 최근 본 상품 추가
 */
export const createUserRecent = (data: CreateUserRecentReq) =>
  api
    .post("user/recent", {
      json: data,
    })
    .json<CommonRes<null>>();

export interface UserRecentProduct {
  productItemId: number;
  brandId: number;
  productName: string;
  brandName: string;
  imageUrl: string;
  price: number;
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
 * @description 유저 최근 본 상품 목록 조회
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
      searchParams: {
        page,
        count,
        search,
        sort,
        languageCode,
      },
    })
    .json<CommonRes<GetUserRecentListRes>>();

export interface GetUserRecentRecommendListRes {
  total: number;
  list: UserRecentProduct[];
}

/**
 * @description 유저 최근 본 상품 기반 추천 상품 목록 조회
 */
export const getUserRecentRecommendList = ({
  languageCode,
}: PublicLanguageCode) =>
  api
    .get("user/recent/recommend", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetUserRecentRecommendListRes>>();
