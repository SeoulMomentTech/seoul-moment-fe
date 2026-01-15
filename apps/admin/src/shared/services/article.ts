import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminArticleSort = SortDirection;
export type AdminArticleSearchColumn = "title";

export type AdminArticleId = Branded<number, "AdminArticleId">;

export interface AdminArticleText {
  languageCode: string;
  title: string;
  content: string;
}

export interface AdminArticleListItem {
  id: AdminArticleId;
  textDto: AdminArticleText[];
  createDate: string;
  updateDate: string;
}

interface AdminArticleListData {
  total: number;
  list: AdminArticleListItem[];
}

export interface AdminArticleListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminArticleSort;
  searchColumn?: AdminArticleSearchColumn;
}

export interface AdminArticleTextPayload {
  languageId: number;
  title: string;
  content: string;
}

export interface AdminArticleSectionTextPayload {
  languageId: number;
  title: string;
  subTitle: string;
  content: string;
}

export interface AdminArticleSectionPayload {
  textList: AdminArticleSectionTextPayload[];
  imageUrlList: string[];
}

export interface CreateAdminArticleRequest {
  categoryId: number;
  brandId?: number;
  list: AdminArticleTextPayload[];
  sectionList: AdminArticleSectionPayload[];
  writer: string;
  banner: string;
  profile: string;
  homeImage: string;
}

export interface UpdateAdminArticleImagePayload {
  oldImageUrl: string;
  newImageUrl: string;
}

export interface UpdateAdminArticleSectionPayload {
  id: number;
  title?: string;
  subTitle?: string;
  content?: string;
  sectionImageList?: UpdateAdminArticleImagePayload[];
}

export interface UpdateAdminArticleInfoTextPayload {
  languageId: number;
  title?: string;
  content?: string;
  section?: UpdateAdminArticleSectionPayload[];
}

export interface V2UpdateAdminArticleRequest {
  categoryId?: number;
  brandId?: number;
  writer?: string;
  banner?: string;
  profile?: string;
  homeImage?: string;
  multilingualTextList?: AdminArticleMultilingualText[];
}

export interface AdminArticleSectionContent {
  id: number;
  title: string;
  subTitle: string;
  content: string;
  imageList: string[];
}

export interface AdminArticleMultilingualText {
  languageId: number;
  title: string;
  content: string;
  section: AdminArticleSectionContent[];
}

export interface AdminArticleDetail {
  id: AdminArticleId;
  categoryId: number;
  brandId?: number;
  writer: string;
  banner: string;
  profile: string;
  homeImage: string;
  multilingualTextList: AdminArticleMultilingualText[];
}

export const getAdminArticleList = (params?: AdminArticleListParams) =>
  fetcher.get<ApiResponse<AdminArticleListData>>("/admin/article", { params });

export const getAdminArticleInfo = (articleId: AdminArticleId) =>
  fetcher.get<ApiResponse<AdminArticleDetail>>(`/admin/article/${articleId}`);

export const createAdminArticle = (payload: CreateAdminArticleRequest) =>
  fetcher.post("/admin/article", payload);

export const updateAdminArticleV2 = (
  articleId: AdminArticleId,
  payload: V2UpdateAdminArticleRequest,
) => fetcher.patch(`/admin/article/v2/${articleId}`, payload);

export const deleteAdminArticle = (articleId: AdminArticleId) =>
  fetcher.delete(`/admin/article/${articleId}`);
