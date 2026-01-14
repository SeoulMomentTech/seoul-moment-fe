import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminNewsSort = SortDirection;
export type AdminNewsSearchColumn = "title";

export type AdminNewsId = Branded<number, "AdminNewsId">;

export interface AdminNewsText {
  languageCode: string;
  title: string;
  content: string;
}

export interface AdminNewsListItem {
  id: AdminNewsId;
  textDto: AdminNewsText[];
  createDate: string;
  updateDate: string;
}

interface AdminNewsListData {
  total: number;
  list: AdminNewsListItem[];
}

export interface AdminNewsListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminNewsSort;
  searchColumn?: AdminNewsSearchColumn;
}

export interface AdminNewsTextPayload {
  languageId: number;
  title: string;
  content: string;
}

export interface AdminNewsSectionTextPayload {
  languageId: number;
  title: string;
  subTitle: string;
  content: string;
}

export interface AdminNewsSectionPayload {
  textList: AdminNewsSectionTextPayload[];
  imageUrlList: string[];
}

export interface CreateAdminNewsRequest {
  categoryId: number;
  brandId?: number;
  list: AdminNewsTextPayload[];
  sectionList: AdminNewsSectionPayload[];
  writer: string;
  banner: string;
  profile: string;
  homeImage: string;
}

export interface UpdateAdminNewsImagePayload {
  oldImageUrl: string;
  newImageUrl: string;
}

export interface UpdateAdminNewsSectionPayload {
  id: number;
  title?: string;
  content?: string;
  imageList?: string[];
}

export interface UpdateAdminNewsInfoTextPayload {
  languageId: number;
  name?: string;
  description?: string;
  section?: UpdateAdminNewsSectionPayload[];
}

export interface UpdateAdminNewsRequest {
  categoryId?: number;
  brandId?: number;
  writer?: string;
  banner?: string;
  profile?: string;
  homeImage?: string;
  multilingualTextList?: UpdateAdminNewsInfoTextPayload[];
}

export interface UpdateAdminNewsSectionPayloadV2 {
  id?: number;
  title?: string;
  content?: string;
  imageList?: string[];
}

export interface UpdateAdminNewsInfoTextPayloadV2 {
  languageId: number;
  name?: string;
  description?: string;
  section?: UpdateAdminNewsSectionPayloadV2[];
}

export interface UpdateAdminNewsRequestV2 {
  categoryId?: number;
  brandId?: number;
  writer?: string;
  banner?: string;
  profile?: string;
  homeImage?: string;
  multilingualTextList?: UpdateAdminNewsInfoTextPayloadV2[];
}

export interface AdminNewsSectionContent {
  id: number;
  title: string;
  subTitle: string;
  content: string;
  imageList: string[];
}

export interface AdminNewsMultilingualText {
  languageId: number;
  title: string;
  content: string;
  section: AdminNewsSectionContent[];
}

export interface AdminNewsDetail {
  id: AdminNewsId;
  categoryId: number;
  brandId?: number;
  writer: string;
  banner: string;
  profile: string;
  homeImage: string;
  multilingualTextList: AdminNewsMultilingualText[];
}

export const getAdminNewsList = (params?: AdminNewsListParams) =>
  fetcher.get<ApiResponse<AdminNewsListData>>("/admin/news", { params });

export const getAdminNewsInfo = (newsId: AdminNewsId) =>
  fetcher.get<ApiResponse<AdminNewsDetail>>(`/admin/news/${newsId}`);

export const createAdminNews = (payload: CreateAdminNewsRequest) =>
  fetcher.post("/admin/news", payload);

export const updateAdminNews = (
  newsId: AdminNewsId,
  payload: UpdateAdminNewsRequest,
) => fetcher.patch(`/admin/news/${newsId}`, payload);

export const updateAdminNewsV2 = (
  newsId: AdminNewsId,
  payload: UpdateAdminNewsRequestV2,
) => fetcher.patch(`/admin/news/v2/${newsId}`, payload);

export const deleteAdminNews = (newsId: AdminNewsId) =>
  fetcher.delete(`/admin/news/${newsId}`);
