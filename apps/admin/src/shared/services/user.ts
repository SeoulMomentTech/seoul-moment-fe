import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

/** 관리자 계정(admin 테이블). 서울모먼트 회원은 member.ts 다 */
export type AdminUserId = Branded<number, "AdminUserId">;

export type AdminUserStatus = "WAIT" | "NORMAL" | "BLOCK" | "DELETE";

/** super_admin 은 환불·강제 탈퇴·권한 관리까지 할 수 있다 */
export type AdminUserRole = "super_admin" | "admin";

export interface AdminUser {
  id: AdminUserId;
  email: string;
  name: string;
  role: AdminUserRole;
  /** 가입 직후는 WAIT. super_admin 전용 API 는 NORMAL 이어야 통과한다 */
  status: AdminUserStatus;
  createDate: string;
  updateDate: string;
}

export interface GetAdminUserListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: SortDirection;
}

export interface GetAdminUserListResponse {
  list: AdminUser[];
  total: number;
}

/** 보낸 필드만 바뀐다. 둘 다 없으면 400 */
export interface PatchAdminUserRequest {
  role?: AdminUserRole;
  status?: AdminUserStatus;
}

/** 403 이 '권한 없음'이라 로그아웃시키지 않는다 */
const SUPER_ADMIN_ONLY = { skipForbiddenLogout: true } as const;

/**
 * @description 관리자 계정 목록
 * Swagger: AdminUserController_getAdminUserList
 */
export const getAdminUserList = (params?: GetAdminUserListParams) =>
  fetcher.get<ApiResponse<GetAdminUserListResponse>>("/admin/user", {
    params,
  });

/**
 * @description 관리자 계정 권한 변경 (역할 · 상태). super_admin 만 된다.
 * 다음 요청부터 바로 적용되고, 자기 자신은 바꿀 수 없다(409)
 * Swagger: AdminUserController_patchAdminUser
 */
export const updateAdminUser = (
  userId: AdminUserId,
  payload: PatchAdminUserRequest,
) =>
  fetcher.patch<ApiResponse<AdminUser>>(
    `/admin/user/${userId}`,
    payload,
    SUPER_ADMIN_ONLY,
  );
