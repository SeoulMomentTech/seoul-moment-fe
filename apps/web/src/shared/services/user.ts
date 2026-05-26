import type { CommonRes } from "./";
import { api } from "./";

export type UserGender = "MALE" | "FEMALE" | "OTHER";

export interface UserInfo {
  phone?: string;
  email: string;
  newProductAgreed: boolean;
  adAgreed: boolean;
  recommendAgreed: boolean;
}

export type GetUserInfoRes = UserInfo;

/**
 * @description 유저 정보 조회
 */
export const getUserInfo = () =>
  api.get("user/info").json<CommonRes<GetUserInfoRes>>();

export interface UpdateUserInfoReq {
  newProductAgreed?: boolean;
  adAgreed?: boolean;
  recommendAgreed?: boolean;
}

/**
 * @description 유저 정보 수정
 */
export const updateUserInfo = (data: UpdateUserInfoReq) =>
  api
    .patch("user/info", {
      json: data,
    })
    .json<CommonRes<null>>();

export interface UserProfile {
  profileImageUrl?: string;
  nickname: string;
  name: string;
  gender: UserGender;
  birthDate: string;
  postalCode: string;
  city: string;
  district: string;
  detailAddress: string;
}

export type CreateUserProfileReq = UserProfile;

/**
 * @description 유저 프로필 생성
 */
export const createUserProfile = (data: CreateUserProfileReq) =>
  api
    .post("user/profile", {
      json: data,
    })
    .json<CommonRes<null>>();

export type UpdateUserProfileReq = UserProfile;

/**
 * @description 유저 프로필 수정
 */
export const updateUserProfile = (data: UpdateUserProfileReq) =>
  api
    .patch("user/profile", {
      json: data,
    })
    .json<CommonRes<null>>();

export type GetUserProfileRes = UserProfile;

/**
 * @description 유저 프로필 조회
 */
export const getUserProfile = () =>
  api.get("user/profile").json<CommonRes<GetUserProfileRes>>();

export interface CreateUserProfileImageReq {
  imageUrl: string;
}

/**
 * @description 유저 프로필 이미지 등록 (기존 이미지가 있으면 교체)
 */
export const createUserProfileImage = (data: CreateUserProfileImageReq) =>
  api
    .post("user/profile/image", {
      json: data,
    })
    .json<CommonRes<null>>();

/**
 * @description 유저 프로필 이미지 삭제
 */
export const deleteUserProfileImage = () => api.delete("user/profile/image");

export interface UserFit {
  height: number;
  weight: number;
  shoeSize: number;
  outerSize: string;
  topSize: string;
  bottomSize: string;
}

export type UserFitPayload = { [K in keyof UserFit]: UserFit[K] | null };

export type CreateUserFitReq = UserFitPayload;

/**
 * @description 유저 체형 정보 생성
 */
export const createUserFit = (data: CreateUserFitReq) =>
  api
    .post("user/fit", {
      json: data,
    })
    .json<CommonRes<null>>();

export type UpdateUserFitReq = UserFitPayload;

/**
 * @description 유저 체형 정보 수정
 */
export const updateUserFit = (data: UpdateUserFitReq) =>
  api
    .patch("user/fit", {
      json: data,
    })
    .json<CommonRes<null>>();

export interface GetUserFitRes {
  height: number | null;
  weight: number | null;
  shoeSize: number | null;
  outerSize: string | null;
  topSize: string | null;
  bottomSize: string | null;
}

/**
 * @description 유저 체형 정보 조회
 */
export const getUserFit = () =>
  api.get("user/fit").json<CommonRes<GetUserFitRes>>();

/**
 * @description 유저 체형 정보 삭제
 */
export const deleteUserFit = () => api.delete("user/fit");
