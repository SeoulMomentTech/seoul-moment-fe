import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type AdminProductCategorySort = "ASC" | "DESC";

export type ProductCategoryId = Branded<number, "ProductCategoryId">;

export interface AdminProductCategoryName {
  languageCode: string;
  name: string;
}

export interface AdminProductCategoryListItem {
  id: ProductCategoryId;
  imageUrl: string;
  nameDto: AdminProductCategoryName[];
  createDate: string;
  updateDate: string;
}

interface AdminProductCategoryListData {
  total: number;
  list: AdminProductCategoryListItem[];
}

export interface AdminProductCategoryListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminProductCategorySort;
}

export interface AdminProductCategoryTextPayload {
  languageId: number;
  name: string;
}

export interface CreateAdminProductCategoryRequest {
  list: AdminProductCategoryTextPayload[];
  categoryId: number;
  imageUrl: string;
}

export interface UpdateAdminProductCategoryRequest {
  list?: AdminProductCategoryTextPayload[];
  categoryId?: number;
  imageUrl?: string;
}

export interface AdminProductCategoryDetail {
  list: AdminProductCategoryTextPayload[];
  categoryId: number;
  imageUrl: string;
  createDate: string;
  updateDate: string;
}

/**
 * @description 상품 서브카테고리 목록
 */
export const getAdminProductCategoryList = (
  params?: AdminProductCategoryListParams,
) =>
  fetcher.get<ApiResponse<AdminProductCategoryListData>>(
    "/admin/product/category/list",
    {
      params,
    },
  );

/**
 * @description 상품 서브카테고리 정보
 */
export const getAdminProductCategoryInfo = (
  productCategoryId: ProductCategoryId,
) =>
  fetcher.get<ApiResponse<AdminProductCategoryDetail>>(
    `/admin/product/category/${productCategoryId}`,
  );

/**
 * @description 상품 서브카테고리 등록
 */
export const createAdminProductCategory = (
  payload: CreateAdminProductCategoryRequest,
) => fetcher.post("/admin/product/category", payload);

/**
 * @description 상품 서브카테고리 수정
 */
export const updateAdminProductCategory = (
  productCategoryId: ProductCategoryId,
  payload: UpdateAdminProductCategoryRequest,
) => fetcher.patch(`/admin/product/category/${productCategoryId}`, payload);

/**
 * @description 상품 서브카테고리 삭제
 */
export const deleteAdminProductCategory = (
  productCategoryId: ProductCategoryId,
) => fetcher.delete(`/admin/product/category/${productCategoryId}`);
