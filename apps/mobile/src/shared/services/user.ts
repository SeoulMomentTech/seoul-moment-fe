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
