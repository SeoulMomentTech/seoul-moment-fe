import type { CommonRes } from ".";
import { api } from ".";

/**
 * 유저 프로필. web 의 UserProfile 과 같은 응답이지만, 모바일에서 쓰는 세 필드만 적는다 —
 * 주소·생년월일은 보여 줄 화면이 아직 없어서 타입만 늘려 두지 않는다.
 */
export interface UserProfile {
  profileImageUrl?: string;
  nickname: string;
  name: string;
}

export type GetUserProfileRes = UserProfile;

/**
 * @description 유저 프로필 조회 (access_token 필요)
 */
export const getUserProfile = () =>
  api.get("user/profile").json<CommonRes<GetUserProfileRes>>();

/**
 * 계정 정보. 프로필(이름·사진)과 달리 "연락 수단과 수신 동의"가 들어 있다.
 * 마케팅 수신 동의 세 개는 지금 화면이 쓰지 않지만, 응답에 늘 들어 있고
 * 이 셋을 빼면 타입이 응답과 다른 모양이 되어 다음 화면에서 또 늘려야 한다.
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
