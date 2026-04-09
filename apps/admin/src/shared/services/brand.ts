import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminBrandSort = SortDirection;
export type AdminBrandSearchColumn = "name";

export type BrandId = Branded<number, "BrandId">;

export type AdminBrandLanguageCode = "ko" | "en" | "zh-TW";

export interface AdminBrandName {
  languageCode: string;
  name: string;
}

export interface AdminBrandListItem {
  id: BrandId;
  nameList: AdminBrandName[];
  createDate: string;
  updateDate: string;
  colorCode: string;
}

interface AdminBrandListData {
  total: number;
  list: AdminBrandListItem[];
}

export interface AdminBrandListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminBrandSort;
  searchColumn?: AdminBrandSearchColumn;
}

export interface AdminBrandTextPayload {
  languageId: number;
  name: string;
  description: string;
}

export interface AdminBrandSectionTextPayload {
  languageId: number;
  title: string;
  content: string;
}

export interface AdminBrandSectionPayload {
  textList: AdminBrandSectionTextPayload[];
  imageUrlList: string[];
}

/** Form model — used internally for Formik state */
export interface CreateAdminBrandRequest {
  textList: AdminBrandTextPayload[];
  categoryId: number;
  profileImageUrl: string;
  sectionList: AdminBrandSectionPayload[];
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  productBannerImageUrl: string;
  englishName: string;
  colorCode: string;
}

export interface V1AdminBrandLanguagePayload {
  languageCode: AdminBrandLanguageCode;
  name: string;
  description: string;
}

export interface V1AdminBrandSectionLanguagePayload {
  languageCode: AdminBrandLanguageCode;
  title: string;
  content: string;
}

export interface V1AdminBrandSectionPayload {
  languageList: V1AdminBrandSectionLanguagePayload[];
  imageUrlList: string[];
}

/** V1 API request payload for brand creation */
export interface V1CreateAdminBrandRequest {
  languageList: V1AdminBrandLanguagePayload[];
  categoryId: number;
  profileImageUrl?: string;
  sectionList: V1AdminBrandSectionPayload[];
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  productBannerImageUrl: string;
  englishName: string;
  colorCode?: string;
}

export interface V1AdminBrandInfoSection {
  id: number;
  title: string;
  content: string;
  imageUrlList: string[];
}

export interface V1AdminBrandInfoText {
  languageCode: AdminBrandLanguageCode;
  name: string;
  description: string;
  section: V1AdminBrandInfoSection[];
}

export interface V1AdminBrandDetail {
  id: BrandId;
  categoryId: number;
  englishName: string;
  profileImageUrl: string;
  productBannerImageUrl: string;
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  languageList: V1AdminBrandInfoText[];
  colorCode: string;
}

export interface V1UpdateAdminBrandInfoSection {
  title: string;
  content: string;
  imageUrlList: string[];
}

export interface V1UpdateAdminBrandInfoText {
  languageCode: AdminBrandLanguageCode;
  name: string;
  description: string;
  section: V1UpdateAdminBrandInfoSection[];
}

export interface V1UpdateAdminBrandRequest {
  categoryId: number;
  englishName: string;
  profileImageUrl?: string;
  productBannerImageUrl: string;
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  languageList: V1UpdateAdminBrandInfoText[];
  colorCode?: string;
}

/**
 * @description 브랜드 리스트 조회 V1
 */
export const getAdminBrandList = (params?: AdminBrandListParams) =>
  fetcher.get<ApiResponse<AdminBrandListData>>("/admin/brand/v1", {
    params,
  });

/**
 * @description 브랜드 다국어 상세 조회 V1
 */
export const getAdminBrandInfo = (brandId: BrandId) =>
  fetcher.get<ApiResponse<V1AdminBrandDetail>>(`/admin/brand/v1/${brandId}`);

/**
 * @description 브랜드 다국어 등록 V1
 */
export const createAdminBrand = (payload: V1CreateAdminBrandRequest) =>
  fetcher.post("/admin/brand/v1", payload);

/**
 * @description 브랜드 수정 V1
 */
export const updateAdminBrand = (
  brandId: BrandId,
  payload: V1UpdateAdminBrandRequest,
) => fetcher.patch(`/admin/brand/v1/${brandId}`, payload);

/**
 * @description 브랜드 삭제
 */
export const deleteAdminBrand = (brandId: BrandId) =>
  fetcher.delete(`/admin/brand/${brandId}`);
