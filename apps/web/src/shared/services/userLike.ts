import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

interface CreateUserProductLikeReq {
  productItemId: number;
}

/**
 * @description 유저 상품 좋아요 추가
 */
export const createUserProductLike = (data: CreateUserProductLikeReq) =>
  api
    .post("user/like/product", {
      json: data,
    })
    .json<CommonRes<null>>();

export interface GetUserProductLikeListReq extends PublicLanguageCode {
  page?: number;
  count?: number;
  search?: string;
  sort?: "ASC" | "DESC";
  productCategoryId?: number;
}

export interface UserProductLike {
  productItemId: number;
  brandName: string;
  productName: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
}

export interface GetUserProductLikeListRes {
  total: number;
  list: UserProductLike[];
}

/**
 * @description 유저 상품 좋아요 목록 조회
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
 * @description 유저 상품 좋아요 삭제
 */
export const deleteUserProductLike = (productItemId: number) =>
  api.delete(`user/like/product/${productItemId}`);

interface CreateUserBrandLikeReq {
  brandId: number;
}

/**
 * @description 유저 브랜드 좋아요 추가
 */
export const createUserBrandLike = (data: CreateUserBrandLikeReq) =>
  api
    .post("user/like/brand", {
      json: data,
    })
    .json<CommonRes<null>>();

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
  recentProductList: UserBrandLikeProduct[];
}

export interface GetUserBrandLikeListRes {
  total: number;
  list: UserBrandLike[];
}

/**
 * @description 유저 브랜드 좋아요 목록 조회
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
      searchParams: {
        page,
        count,
        search,
        sort,
        languageCode,
      },
    })
    .json<CommonRes<GetUserBrandLikeListRes>>();

/**
 * @description 유저 브랜드 좋아요 삭제
 */
export const deleteUserBrandLike = (brandId: number) =>
  api.delete(`user/like/brand/${brandId}`);
