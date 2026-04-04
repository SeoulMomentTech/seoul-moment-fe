import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminBrandSort = SortDirection;
export type AdminBrandSearchColumn = "name";

export type BrandId = Branded<number, "BrandId">;

export interface AdminBrandName {
  languageCode: string;
  name: string;
}

export interface AdminBrandListItem {
  id: BrandId;
  nameDto: AdminBrandName[];
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

export type AdminBrandLanguageCode = "ko" | "en" | "zh-TW";

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

export interface AdminBrandSectionContentV2 {
  title: string;
  content: string;
  imageList: string[];
}

export interface AdminBrandMultilingualTextV2 {
  languageId: number;
  name: string;
  description: string;
  section: AdminBrandSectionContentV2[];
}

export interface V2UpdateAdminBrandRequest {
  categoryId: number;
  englishName: string;
  profileImage: string;
  productBannerImage: string;
  bannerList: string[];
  mobileBannerList: string[];
  multilingualTextList: AdminBrandMultilingualTextV2[];
  colorCode: string;
}

export interface AdminBrandSectionContent {
  id: number;
  title: string;
  content: string;
  imageList: string[];
}

export interface AdminBrandMultilingualText {
  languageId: number;
  name: string;
  description: string;
  section: AdminBrandSectionContent[];
}

export interface AdminBrandDetail {
  id: BrandId;
  categoryId: number;
  englishName: string;
  profileImage: string;
  productBannerImage: string;
  bannerList: string[];
  mobileBannerList: string[];
  multilingualTextList: AdminBrandMultilingualText[];
  colorCode: string;
}

/**
 * @description 브랜드 리스트 조회
 */
export const getAdminBrandList = (params?: AdminBrandListParams) =>
  fetcher.get<ApiResponse<AdminBrandListData>>("/admin/brand", {
    params,
  });

/**
 * @description 브랜드 다국어 상세 조회
 */
export const getAdminBrandInfo = (brandId: BrandId) =>
  fetcher.get<ApiResponse<AdminBrandDetail>>(`/admin/brand/${brandId}`);

/**
 * @description 브랜드 다국어 등록 V1
 */
export const createAdminBrand = (payload: V1CreateAdminBrandRequest) =>
  fetcher.post("/admin/brand/v1", payload);


/**
 * @description 브랜드 수정 V2 (전체 데이터 교체 방식)
 */
export const updateAdminBrandV2 = (
  brandId: BrandId,
  payload: V2UpdateAdminBrandRequest,
) => fetcher.patch(`/admin/brand/${brandId}/v2`, payload);

/**
 * @description 브랜드 삭제
 */
export const deleteAdminBrand = (brandId: BrandId) =>
  fetcher.delete(`/admin/brand/${brandId}`);
