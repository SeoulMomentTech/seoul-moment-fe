import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminCategorySort = SortDirection;
export type AdminCategorySearchColumn = "name";

export type CategoryId = Branded<number, "CategoryId">;

export interface AdminCategoryLanguageDto {
  languageCode: string;
  name: string;
}

export interface AdminCategory {
  id: CategoryId;
  languageList: AdminCategoryLanguageDto[];
  createDate: string;
  updateDate: string;
}

interface AdminCategoryListData {
  total: number;
  list: AdminCategory[];
}

type AdminCategoryDetailData = AdminCategory;

export interface AdminCategoryListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminCategorySort;
  searchColumn?: AdminCategorySearchColumn;
}

export interface UpdateAdminCategoryRequest {
  languageList: AdminCategoryLanguageDto[];
  sortOrder: number;
}

/**
 * @description 카테고리 목록 조회 V1
 */
export const getAdminCategoryList = (params?: AdminCategoryListParams) =>
  fetcher.get<ApiResponse<AdminCategoryListData>>("/admin/category/v1", {
    params,
  });

/**
 * @description 카테고리 정보 조회 V1
 */
export const getAdminCategory = (categoryId: number) =>
  fetcher.get<ApiResponse<AdminCategoryDetailData>>(
    `/admin/category/v1/${categoryId}`,
  );

/**
 * @description 카테고리 생성
 */
export const createAdminCategory = (payload: { name: string }) =>
  fetcher.post("/admin/category", payload);

/**
 * @description 카테고리 수정 V1
 */
export const updateAdminCategory = (
  categoryId: CategoryId,
  payload: UpdateAdminCategoryRequest,
) => fetcher.patch(`/admin/category/v1/${categoryId}`, payload);

/**
 * @description 카테고리 삭제
 */
export const deleteAdminCategory = (categoryId: CategoryId) =>
  fetcher.delete(`/admin/category/${categoryId}`);
