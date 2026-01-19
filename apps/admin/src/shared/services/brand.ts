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

export interface CreateAdminBrandRequest {
  textList: AdminBrandTextPayload[];
  categoryId: number;
  profileImageUrl: string;
  sectionList: AdminBrandSectionPayload[];
  bannerImageUrlList: string[];
  mobileBannerImageUrlList: string[];
  productBannerImageUrl: string;
  productMobileBannerImageUrl: string;
  englishName: string;
}

export interface UpdateAdminBrandImagePayload {
  oldImageUrl: string;
  newImageUrl: string;
}

export interface UpdateAdminBrandSectionImageSortOrder {
  imageUrl: string;
  sortOrder: number;
}

export interface UpdateAdminBrandSectionSortOrder {
  sectionId: number;
  sortOrder: number;
}

export interface UpdateAdminBrandSectionPayload {
  id: number;
  textList: AdminBrandSectionTextPayload[];
  imageUrlList: UpdateAdminBrandImagePayload[];
  imageSortOrderList: UpdateAdminBrandSectionImageSortOrder[];
}

export interface UpdateAdminBrandRequest {
  textList: AdminBrandTextPayload[];
  categoryId: number;
  profileImageUrl: string;
  sectionList: UpdateAdminBrandSectionPayload[];
  bannerImageUrlList: UpdateAdminBrandImagePayload[];
  mobileBannerImageUrlList: UpdateAdminBrandImagePayload[];
  productBannerImage: string;
  englishName: string;
  sectionSortOrderList: UpdateAdminBrandSectionSortOrder[];
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
}

export const getAdminBrandList = (params?: AdminBrandListParams) =>
  fetcher.get<ApiResponse<AdminBrandListData>>("/admin/brand", {
    params,
  });

export const getAdminBrandInfo = (brandId: BrandId) =>
  fetcher.get<ApiResponse<AdminBrandDetail>>(`/admin/brand/${brandId}`);

export const createAdminBrand = (payload: CreateAdminBrandRequest) =>
  fetcher.post("/admin/brand", payload);

export const updateAdminBrand = (
  brandId: BrandId,
  payload: UpdateAdminBrandRequest,
) => fetcher.patch(`/admin/brand/${brandId}`, payload);

export const deleteAdminBrand = (brandId: BrandId) =>
  fetcher.delete(`/admin/brand/${brandId}`);
