import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type AdminCategorySort = "ASC" | "DESC";
export type AdminCategorySearchColumn = "name";

export type CategoryId = Branded<number, "CatagoryId">;

export interface AdminCategoryName {
  languageCode: string;
  name: string;
}

export interface AdminCategory {
  id: CategoryId;
  nameDto: AdminCategoryName[];
}

interface AdminCategoryListData {
  total: number;
  list: AdminCategory[];
}

export interface AdminCategoryListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminCategorySort;
  searchColumn?: AdminCategorySearchColumn;
}

export interface AdminCategoryTextPayload {
  languageId: number;
  name: string;
}

export interface CreateAdminCategoryRequest {
  list: AdminCategoryTextPayload[];
}

export interface UpdateAdminCategoryRequest {
  list?: AdminCategoryTextPayload[];
  sortOrder?: number;
}

export const getAdminCategoryList = (params?: AdminCategoryListParams) =>
  fetcher.get<ApiResponse<AdminCategoryListData>>("/admin/category", {
    params,
  });

export const getAdminCategory = (categoryId: number) =>
  fetcher.get<ApiResponse<AdminCategoryListData>>(
    `/admin/category/${categoryId}`,
  );

export const createAdminCategory = (payload: CreateAdminCategoryRequest) =>
  fetcher.post("/admin/category", payload);

export const updateAdminCategory = (
  categoryId: CategoryId,
  payload: UpdateAdminCategoryRequest,
) => fetcher.patch(`/admin/category/${categoryId}`, payload);

export const deleteAdminCategory = (categoryId: CategoryId) =>
  fetcher.delete(`/admin/category/${categoryId}`);
