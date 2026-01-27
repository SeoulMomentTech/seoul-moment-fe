import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminProductStatus = "NORMAL" | "WAIT" | "BLOCK" | "DELETE";

export interface GetAdminProductNameDto {
  languageCode: string;
  name: string;
}

export interface GetAdminProductResponse {
  id: number;
  nameDto: GetAdminProductNameDto[];
  createDate: string;
  updateDate: string;
}

export interface GetAdminProductListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: SortDirection;
  sortColumn: "createDate" | "price";
}

export interface GetAdminProductListResponse {
  total: number;
  list: GetAdminProductResponse[];
}

export interface PostAdminProductLanguage {
  languageId: number;
  name: string;
  origin: string;
}

export interface PostAdminProductRequest {
  brandId: number;
  categoryId: number;
  productCategoryId: number;
  detailInfoImageUrl: string;
  text: PostAdminProductLanguage[];
}

export interface PatchAdminProductLanguage {
  languageId: number;
  name: string;
  origin: string;
}

export interface PatchAdminProductRequest {
  text?: PatchAdminProductLanguage[];
  status?: AdminProductStatus;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  detailInfoImageUrl?: string;
}

export interface GetAdminProductDetailResponse {
  id: number;
  brandId: number;
  categoryId: number;
  productCategoryId: number;
  detailInfoImageUrl: string;
  status: AdminProductStatus;
  nameDto: GetAdminProductNameDto[];
  createDate: string;
  updateDate: string;
}

/**
 * @description 대주제 상품 리스트
 */
export const getAdminProductList = (params: GetAdminProductListParams) =>
  fetcher.get<ApiResponse<GetAdminProductListResponse>>("/admin/product", {
    params,
  });

/**
 * @description 상품 대주제 등록
 */
export const postAdminProduct = (payload: PostAdminProductRequest) =>
  fetcher.post<ApiResponse<void>>("/admin/product", payload);

/**
 * @description 상품 대주제 삭제
 */
export const deleteAdminProduct = (id: number) =>
  fetcher.delete<ApiResponse<void>>(`/admin/product/${id}`);

/**
 * @description 상품 대주제 수정
 */
export const patchAdminProduct = (
  id: number,
  payload: PatchAdminProductRequest,
) => fetcher.patch<ApiResponse<void>>(`/admin/product/${id}`, payload);

/**
 * @description 상품 대주제 상세 조회
 */
export const getAdminProductDetail = (id: number) =>
  fetcher.get<ApiResponse<GetAdminProductDetailResponse>>(
    `/admin/product/${id}`,
  );
