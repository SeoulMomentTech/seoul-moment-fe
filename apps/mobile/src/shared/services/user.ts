import type { HTTPError } from "ky";

import type { CommonRes } from ".";
import { api } from ".";

export type UserGender = "MALE" | "FEMALE" | "OTHER";

/**
 * 유저 프로필. web 의 UserProfile 과 같은 응답이고, 이제 계정 화면이 주소·생년월일까지
 * 쓰므로 응답의 모든 필드를 적는다.
 */
export interface UserProfile {
  profileImageUrl?: string;
  nickname: string;
  name: string;
  gender: UserGender;
  /** `YYYY-MM-DD`. 한 번도 저장하지 않았으면 빈 문자열로 온다. */
  birthDate: string;
  postalCode: string;
  city: string;
  district: string;
  detailAddress: string;
}

export type GetUserProfileRes = UserProfile;

/**
 * @description 유저 프로필 조회 (access_token 필요)
 */
export const getUserProfile = () =>
  api.get("user/profile").json<CommonRes<GetUserProfileRes>>();

/** 닉네임·이름·사진은 각자 전용 엔드포인트가 있어 이 PATCH 가 받지 않는다. */
export type UpdateUserProfileReq = Omit<
  UserProfile,
  "nickname" | "name" | "profileImageUrl"
>;

/**
 * @description 유저 프로필 수정 (access_token 필요)
 */
export const updateUserProfile = (data: UpdateUserProfileReq) =>
  api.patch("user/profile", { json: data }).json<CommonRes<null>>();

export interface UpdateUserProfileNicknameReq {
  nickname: string;
}

/**
 * @description 유저 닉네임 수정 (access_token 필요)
 */
export const updateUserProfileNickname = (data: UpdateUserProfileNicknameReq) =>
  api.patch("user/profile/nickname", { json: data }).json<CommonRes<null>>();

export interface UpdateUserProfileNameReq {
  name: string;
}

/**
 * @description 유저 이름 수정 (access_token 필요)
 */
export const updateUserProfileName = (data: UpdateUserProfileNameReq) =>
  api.patch("user/profile/name", { json: data }).json<CommonRes<null>>();

/**
 * 계정 정보. 프로필(이름·사진)과 달리 "연락 수단과 수신 동의"가 들어 있다.
 */
export interface UserInfo {
  email: string;
  phone?: string;
  newProductAgreed: boolean;
  adAgreed: boolean;
  recommendAgreed: boolean;
}

export type GetUserInfoRes = UserInfo;

/**
 * @description 유저 계정 정보 조회 (access_token 필요)
 */
export const getUserInfo = () =>
  api.get("user/info").json<CommonRes<GetUserInfoRes>>();

/**
 * 수신 동의만 고친다. 이메일은 바꿀 수 없고, 전화번호는 인증 엔드포인트가 세운다 —
 * 이 PATCH 로는 번호를 보내지 않는다(web 도 같다).
 */
export interface UpdateUserInfoReq {
  newProductAgreed?: boolean;
  adAgreed?: boolean;
  recommendAgreed?: boolean;
}

/**
 * @description 유저 계정 정보 수정 (access_token 필요)
 */
export const updateUserInfo = (data: UpdateUserInfoReq) =>
  api.patch("user/info", { json: data }).json<CommonRes<null>>();

/**
 * 체형 정보. 조회 응답은 모든 칸이 null 일 수 있고, 한 번도 저장하지 않았으면
 * data 자체가 null 이다 — 그 차이가 POST(생성)와 PATCH(수정)를 가른다.
 */
export interface GetUserFitRes {
  height: number | null;
  weight: number | null;
  shoeSize: number | null;
  outerSize: string | null;
  topSize: string | null;
  bottomSize: string | null;
}

/** 쓰기는 조회와 같은 모양이다. 비우는 칸은 생략이 아니라 null 로 보낸다. */
export type UserFitPayload = GetUserFitRes;

export type CreateUserFitReq = UserFitPayload;
export type UpdateUserFitReq = UserFitPayload;

/**
 * @description 유저 체형 정보 조회 (access_token 필요)
 *
 * 한 번도 저장하지 않았으면 서버가 404 를 준다. ky 는 404 에 예외를 던지므로
 * 그대로 두면 "불러올 수 없음" 화면이 떠서, 처음 쓰는 사람이 빈 폼에 닿지 못한다.
 * 여기서만 404 를 data: null 로 바꿔, "없음" 을 실패가 아닌 값으로 흘린다.
 * 나머지 상태 코드는 그대로 던진다 — 진짜 실패까지 빈 폼으로 덮으면 안 된다.
 */
export const getUserFit = async (): Promise<
  CommonRes<GetUserFitRes | null>
> => {
  try {
    return await api.get("user/fit").json<CommonRes<GetUserFitRes | null>>();
  } catch (error) {
    if ((error as HTTPError)?.response?.status === 404) {
      return { result: true, data: null };
    }
    throw error;
  }
};

/**
 * @description 유저 체형 정보 생성 (access_token 필요)
 */
export const createUserFit = (data: CreateUserFitReq) =>
  api.post("user/fit", { json: data }).json<CommonRes<null>>();

/**
 * @description 유저 체형 정보 수정 (access_token 필요)
 */
export const updateUserFit = (data: UpdateUserFitReq) =>
  api.patch("user/fit", { json: data }).json<CommonRes<null>>();
