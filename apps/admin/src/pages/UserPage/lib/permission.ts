import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  PatchAdminUserRequest,
} from "@shared/services/user";

export const ADMIN_ROLES: AdminUserRole[] = ["admin", "super_admin"];

export const ADMIN_ROLE_LABEL: Record<AdminUserRole, string> = {
  super_admin: "최고 관리자",
  admin: "관리자",
};

export const ADMIN_STATUSES: AdminUserStatus[] = [
  "WAIT",
  "NORMAL",
  "BLOCK",
  "DELETE",
];

export const ADMIN_STATUS_LABEL: Record<AdminUserStatus, string> = {
  WAIT: "승인 대기",
  NORMAL: "정상",
  BLOCK: "차단",
  DELETE: "삭제",
};

export interface PermissionValues {
  role: AdminUserRole;
  status: AdminUserStatus;
}

/** 바뀐 필드만 보낸다. 하나도 안 바뀌면 빈 객체 — 서버는 400 을 준다 */
export const toPermissionPatch = (
  user: Pick<AdminUser, "role" | "status">,
  values: PermissionValues,
): PatchAdminUserRequest => ({
  ...(values.role !== user.role && { role: values.role }),
  ...(values.status !== user.status && { status: values.status }),
});

/** super_admin 전용 API(환불·강제 탈퇴·권한 관리)는 역할과 상태가 둘 다 맞아야 통과한다 */
export const canUseSuperAdminApi = ({ role, status }: PermissionValues) =>
  role === "super_admin" && status === "NORMAL";
