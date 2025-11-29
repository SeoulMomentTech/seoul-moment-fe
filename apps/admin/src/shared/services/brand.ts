import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type AdminBrandSort = "ASC" | "DESC";
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
  bannerImageUrl: string;
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

export interface UpdateAdminBrandInfoSection {
  id: number;
  title?: string;
  content?: string;
  sectionImageList?: UpdateAdminBrandImagePayload[];
  sortOrderList?: UpdateAdminBrandSectionImageSortOrder[];
}

export interface UpdateAdminBrandInfoText {
  languageId: number;
  name?: string;
  description?: string;
  section?: UpdateAdminBrandInfoSection[];
}

export interface UpdateAdminBrandSectionSortOrder {
  sectionId: number;
  sortOrder: number;
}

export interface UpdateAdminBrandRequest {
  productBannerImage?: string;
  profileImage?: string;
  englishName?: string;
  bannerList?: UpdateAdminBrandImagePayload[];
  mobileBannerList?: UpdateAdminBrandImagePayload[];
  textList?: UpdateAdminBrandInfoText[];
  sectionSortOrderList?: UpdateAdminBrandSectionSortOrder[];
}

export interface AdminBrandSectionContent {
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
