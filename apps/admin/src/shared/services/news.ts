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

export interface UpdateAdminNewsSectionPayloadV2 {
  id?: number;
  title?: string;
  subTitle?: string;
  content?: string;
  imageList?: string[];
}

export interface UpdateAdminNewsInfoTextPayloadV2 {
  languageId: number;
  title?: string;
  content?: string;
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

/**
 * V1 뉴스 상세 (V1AdminNews) — newsCategoryId, hashtagId, editorPick 필드 추가
 */
export interface AdminNewsDetailV1 extends AdminNewsDetail {
  newsCategoryId: number;
  hashtagId?: number;
  editorPick: boolean;
}

export interface CreateAdminNewsRequestV1 extends CreateAdminNewsRequest {
  newsCategoryId: number;
}

export interface UpdateAdminNewsRequestV1 extends UpdateAdminNewsRequestV2 {
  newsCategoryId: number;
  editorPick: boolean;
  hashtagId?: number;
}

// ----- 뉴스 카테고리 -----

export type AdminNewsCategoryId = Branded<number, "AdminNewsCategoryId">;

export interface AdminNewsNameDto {
  languageId: number;
  languageCode: "ko" | "en" | "zh-TW";
  name: string;
}

export interface AdminNewsNamePayload {
  languageId: number;
  name: string;
}

export interface AdminNewsCategory {
  id: AdminNewsCategoryId;
  nameList: AdminNewsNameDto[];
}

interface AdminNewsCategoryListData {
  total: number;
  list: AdminNewsCategory[];
}

export interface UpdateAdminNewsCategoryRequest {
  nameList: AdminNewsNamePayload[];
}

// ----- 뉴스 해시태그 -----

export type AdminNewsHashtagId = Branded<number, "AdminNewsHashtagId">;

export interface AdminNewsHashtag {
  id: AdminNewsHashtagId;
  nameList: AdminNewsNameDto[];
}

interface AdminNewsHashtagListData {
  total: number;
  list: AdminNewsHashtag[];
}

export interface UpdateAdminNewsHashtagRequest {
  nameList: AdminNewsNamePayload[];
}

/**
 * @description 뉴스 리스트 조회
 */
export const getAdminNewsList = (params?: AdminNewsListParams) =>
  fetcher.get<ApiResponse<AdminNewsListData>>("/admin/news", { params });

/**
 * @description 뉴스 삭제
 */
export const deleteAdminNews = (newsId: AdminNewsId) =>
  fetcher.delete(`/admin/news/${newsId}`);

/**
 * @description 뉴스 데이터 입력 (V1)
 */
export const createAdminNewsV1 = (payload: CreateAdminNewsRequestV1) =>
  fetcher.post("/admin/news/v1", payload);

/**
 * @description 뉴스 다국어 조회 (V1)
 */
export const getAdminNewsInfoV1 = (newsId: AdminNewsId) =>
  fetcher.get<ApiResponse<AdminNewsDetailV1>>(`/admin/news/v1/${newsId}`);

/**
 * @description 뉴스 수정 (V1)
 */
export const updateAdminNewsV1 = (
  newsId: AdminNewsId,
  payload: UpdateAdminNewsRequestV1,
) => fetcher.patch(`/admin/news/v1/${newsId}`, payload);

// ----- 뉴스 카테고리 -----

/**
 * @description 뉴스 카테고리 리스트 조회
 */
export const getAdminNewsCategoryList = () =>
  fetcher.get<ApiResponse<AdminNewsCategoryListData>>("/admin/news/category");

/**
 * @description 뉴스 카테고리 다국어 조회
 */
export const getAdminNewsCategoryInfo = (categoryId: AdminNewsCategoryId) =>
  fetcher.get<ApiResponse<AdminNewsCategory>>(
    `/admin/news/category/${categoryId}`,
  );

/**
 * @description 뉴스 카테고리 다국어 수정
 */
export const updateAdminNewsCategory = (
  categoryId: AdminNewsCategoryId,
  payload: UpdateAdminNewsCategoryRequest,
) => fetcher.patch(`/admin/news/category/${categoryId}`, payload);

/**
 * @description 뉴스 카테고리 삭제
 */
export const deleteAdminNewsCategory = (categoryId: AdminNewsCategoryId) =>
  fetcher.delete(`/admin/news/category/${categoryId}`);

// ----- 뉴스 해시태그 -----

/**
 * @description 뉴스 해시태그 리스트 조회
 */
export const getAdminNewsHashtagList = () =>
  fetcher.get<ApiResponse<AdminNewsHashtagListData>>("/admin/news/hashtag");

/**
 * @description 뉴스 해시태그 다국어 조회
 */
export const getAdminNewsHashtagInfo = (hashtagId: AdminNewsHashtagId) =>
  fetcher.get<ApiResponse<AdminNewsHashtag>>(
    `/admin/news/hashtag/${hashtagId}`,
  );

/**
 * @description 뉴스 해시태그 다국어 수정
 */
export const updateAdminNewsHashtag = (
  hashtagId: AdminNewsHashtagId,
  payload: UpdateAdminNewsHashtagRequest,
) => fetcher.patch(`/admin/news/hashtag/${hashtagId}`, payload);

/**
 * @description 뉴스 해시태그 삭제
 */
export const deleteAdminNewsHashtag = (hashtagId: AdminNewsHashtagId) =>
  fetcher.delete(`/admin/news/hashtag/${hashtagId}`);
