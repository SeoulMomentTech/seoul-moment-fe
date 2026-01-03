import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminProductBannerSort = SortDirection;
export type ProductBannerId = Branded<number, "ProductBannerId">;

export interface AdminProductBannerListItem {
  id: ProductBannerId;
  imageUrl: string;
  sort: number;
  createDate: string;
  updateDate: string;
}

interface AdminProductBannerListData {
  total: number;
  list: AdminProductBannerListItem[];
}

export interface AdminProductBannerListParams {
  page?: number;
  count?: number;
  sort?: AdminProductBannerSort;
}

export interface CreateAdminProductBannerRequest {
  imageUrl: string;
}

export interface UpdateAdminProductBannerSortOrder {
  id: ProductBannerId;
  sortOrder: number;
}

export interface UpdateAdminProductBannerSortOrderRequest {
  list: UpdateAdminProductBannerSortOrder[];
}

export interface UpdateAdminProductBannerRequest {
  imageUrl: string;
}

export interface AdminProductBannerDetail {
  id: ProductBannerId;
  imageUrl: string;
  sortOrder: number;
  createDate: string;
  updateDate: string;
}

/**
 * @description 상품 배너 리스트 조회
 */
export const getAdminProductBannerList = (
  params?: AdminProductBannerListParams,
) =>
  fetcher.get<ApiResponse<AdminProductBannerListData>>(
    "/admin/product/banner/list",
    {
      params,
    },
  );

/**
 * @description 상품 배너 등록
 */
export const createAdminProductBanner = (
  payload: CreateAdminProductBannerRequest,
) => fetcher.post("/admin/product/banner", payload);

/**
 * @description 상품 배너 정렬 순서 수정
 */
export const updateAdminProductBannerSortOrder = (
  payload: UpdateAdminProductBannerSortOrderRequest,
) => fetcher.patch("/admin/product/banner/sort", payload);

/**
 * @description 상품 배너 수정
 */
export const updateAdminProductBanner = (
  productBannerId: ProductBannerId,
  payload: UpdateAdminProductBannerRequest,
) => fetcher.patch(`/admin/product/banner/${productBannerId}`, payload);

/**
 * @description 상품 배너 삭제
 */
export const deleteAdminProductBanner = (productBannerId: ProductBannerId) =>
  fetcher.delete(`/admin/product/banner/${productBannerId}`);

/**
 * @description 상품 배너 상세 조회
 */
export const getAdminProductBannerDetail = (productBannerId: ProductBannerId) =>
  fetcher.get<ApiResponse<AdminProductBannerDetail>>(
    `/admin/product/banner/${productBannerId}`,
  );
