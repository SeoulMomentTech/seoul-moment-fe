import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminUserStatus = "WAIT" | "NORMAL" | "BLOCK" | "DELETE";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
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

/**
 * @description Admin user list 조회
 * Swagger: AdminUserController_getAdminUserList
 */
export const getAdminUserList = (params?: GetAdminUserListParams) =>
  fetcher.get<ApiResponse<GetAdminUserListResponse>>("/admin/user", {
    params,
  });
