import { type ApiResponse } from "./types";

import { fetcher } from ".";

export interface PaginatedData<T> {
  total: number;
  list: T[];
}

export interface PostAdminBrandPromotionLanguageDto {
  languageId: number;
  description: string;
}

export interface PostAdminBrandPromotionBannerLanguageDto {
  languageId: number;
  title: string;
}

export interface PostAdminBrandPromotionBannerBaseDto {
  imagePath: string;
  mobileImagePath: string;
  linkUrl: string;
  language: PostAdminBrandPromotionBannerLanguageDto[];
}

export interface PostAdminBrandPromotionSectionBaseDto {
  type: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5";
  imagePathList: string[];
}

export interface PostAdminBrandPromotionPopupLanguageDto {
  languageId: number;
  title: string;
  description: string;
}

export interface PostAdminBrandPromotionPopupBaseDto {
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  isActive: boolean;
  language: PostAdminBrandPromotionPopupLanguageDto[];
  imagePathList: string[];
}

export interface PostAdminBrandPromotionNoticsLanguageDto {
  languageId: number;
  content: string;
}

export interface PostAdminBrandPromotionNoticsBaseDto {
  language: PostAdminBrandPromotionNoticsLanguageDto[];
}

export interface PostAdminBrandPromotionEventLanguageDto {
  languageId: number;
  title: string;
}

export interface PostAdminBrandPromotionEventBaseDto {
  language: PostAdminBrandPromotionEventLanguageDto[];
  status: "NORMAL" | "DELETE";
}

export interface PostAdminBrandPromotionEventCouponLanguageDto {
  languageId: number;
  title: string;
  description: string;
}

export interface PostAdminBrandPromotionEventCouponBaseDto {
  imagePath: string;
  language: PostAdminBrandPromotionEventCouponLanguageDto[];
}

export interface PostAdminBrandPromotionEventAndCouponDto {
  event: PostAdminBrandPromotionEventBaseDto;
  coupon: PostAdminBrandPromotionEventCouponBaseDto[];
}

export interface PostAdminBrandPromotionRequest {
  brandId: number;
  brandDescriptionLanguage: PostAdminBrandPromotionLanguageDto[];
  isActive?: boolean;
  bannerList: PostAdminBrandPromotionBannerBaseDto[];
  sectionList: PostAdminBrandPromotionSectionBaseDto[];
  popupList: PostAdminBrandPromotionPopupBaseDto[];
  noticeList?: PostAdminBrandPromotionNoticsBaseDto[];
  eventAndCouponList?: PostAdminBrandPromotionEventAndCouponDto[];
}

export interface GetAdminBrandPromotionResponse {
  id: number;
  brandId: number;
  isActive: boolean;
  createDate: string;
  updateDate: string;
}

export interface GetAdminBrandPromotionLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  description: string;
}

export interface GetAdminBrandPromotionDetailBrandDto {
  id: number;
  name: string;
  profileImageUrl: string;
  language: GetAdminBrandPromotionLanguageDto[];
  likeCount: number;
}

export interface AdminBrandPromotionBannerLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  title: string;
}

export interface GetAdminBrandPromotionBannerResponse {
  id: number;
  brandPromotionId: number;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  createDate: string;
  updateDate: string;
  language: AdminBrandPromotionBannerLanguageDto[];
}

export interface GetAdminBrandPromotionSectionResponse {
  id: number;
  brandPromotionId: number;
  type: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5";
  imageUrlList: string[];
}

export interface GetAdminBrandPromotionPopupLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  title: string;
  description: string;
}

export interface GetAdminBrandPromotionPopupResponse {
  id: number;
  brandPromotionId: number;
  place: string;
  address: string;
  latitude: string;
  longitude: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  isActive: boolean;
  language: GetAdminBrandPromotionPopupLanguageDto[];
  createDate: string;
  updateDate: string;
  imageUrlList: string[];
}

export interface GetAdminBrandPromotionEventLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  title: string;
}

export interface GetAdminBrandPromotionEventResponse {
  id: number;
  brandPromotionId: number;
  language: GetAdminBrandPromotionEventLanguageDto[];
  status: "NORMAL" | "DELETE";
  createDate: string;
  updateDate: string;
}

export interface GetAdminBrandPromotionEventCouponLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  title: string;
  description: string;
}

export interface GetAdminBrandPromotionEventCouponResponse {
  id: number;
  brandPromotionEventId: number;
  imageUrl: string;
  language: GetAdminBrandPromotionEventCouponLanguageDto[];
  status: "NORMAL" | "DELETE";
  createDate: string;
  updateDate: string;
}

export interface GetAdminBrandPromotionEventAndCouponDto {
  event: GetAdminBrandPromotionEventResponse;
  coupon: GetAdminBrandPromotionEventCouponResponse[];
}

export interface GetAdminBrandPromotionDetailResponse {
  id: number;
  brandDto: GetAdminBrandPromotionDetailBrandDto;
  bannerList: GetAdminBrandPromotionBannerResponse[];
  sectionList: GetAdminBrandPromotionSectionResponse[];
  popupList: GetAdminBrandPromotionPopupResponse[];
  noticeList?: GetAdminBrandPromotionNoticsResponse[];
  eventAndCouponList?: GetAdminBrandPromotionEventAndCouponDto[];
  isActive: boolean;
}

export interface PostAdminBrandPromotionSectionRequest {
  type: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5";
  imagePathList: string[];
  brandPromotionId: number;
}

export interface GetAdminBrandPromotionSectionDetailResponse {
  id: number;
  brandPromotionId: number;
  type: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5";
  imageUrlList: string[];
}

export interface PatchAdminBrandPromotionSectionRequest {
  brandPromotionId: number;
  type: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5";
  imageUrlList: string[];
}

export interface PostAdminBrandPromotionBannerRequest {
  imagePath: string;
  mobileImagePath: string;
  linkUrl: string;
  language: PostAdminBrandPromotionBannerLanguageDto[];
  brandPromotionId: number;
}

export interface GetAdminBrandPromotionBannerDetailResponse {
  id: number;
  brandPromotionId: number;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  createDate: string;
  updateDate: string;
  language: AdminBrandPromotionBannerLanguageDto[];
}

export interface PatchAdminBrandPromotionBannerRequest {
  brandPromotionId: number;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  language: AdminBrandPromotionBannerLanguageDto[];
}

export interface PostAdminBrandPromotionNoticsRequest {
  language: PostAdminBrandPromotionNoticsLanguageDto[];
  brandPromotionId: number;
}

export interface GetAdminBrandPromotionNoticsLanguageDto {
  languageCode: "ko" | "en" | "zh-TW";
  content: string;
}

export interface GetAdminBrandPromotionNoticsResponse {
  id: number;
  brandPromotionId: number;
  language: GetAdminBrandPromotionNoticsLanguageDto[];
  createDate: string;
  updateDate: string;
}

export interface GetAdminBrandPromotionNoticsDetailResponse {
  id: number;
  brandPromotionId: number;
  language: GetAdminBrandPromotionNoticsLanguageDto[];
  createDate: string;
  updateDate: string;
}

export interface PatchAdminBrandPromotionNoticsRequest {
  brandPromotionId: number;
  language: GetAdminBrandPromotionNoticsLanguageDto[];
}

export interface PostAdminBrandPromotionPopupRequest {
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  isActive: boolean;
  language: PostAdminBrandPromotionPopupLanguageDto[];
  imagePathList: string[];
  brandPromotionId: number;
}

export interface GetAdminBrandPromotionPopupDetailResponse {
  id: number;
  brandPromotionId: number;
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  language: GetAdminBrandPromotionPopupLanguageDto[];
  createDate: string;
  updateDate: string;
  imageUrlList: string[];
}

export interface PatchAdminBrandPromotionPopupRequest {
  brandPromotionId: number;
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  isActive: boolean;
  language: GetAdminBrandPromotionPopupLanguageDto[];
  imageUrlList: string[];
}

export interface PostAdminBrandPromotionEventRequest {
  language: PostAdminBrandPromotionEventLanguageDto[];
  status: "NORMAL" | "DELETE";
  brandPromotionId: number;
}

export interface GetAdminBrandPromotionEventDetailResponse {
  id: number;
  brandPromotionId: number;
  language: GetAdminBrandPromotionEventLanguageDto[];
  status: "NORMAL" | "DELETE";
  createDate: string;
  updateDate: string;
}

export interface PatchAdminBrandPromotionEventRequest {
  brandPromotionId: number;
  language: GetAdminBrandPromotionEventLanguageDto[];
  status: "NORMAL" | "DELETE";
}

export interface PostAdminBrandPromotionEventCouponRequest {
  imagePath: string;
  language: PostAdminBrandPromotionEventCouponLanguageDto[];
  brandPromotionEventId: number;
}

export interface GetAdminBrandPromotionEventCouponDetailResponse {
  id: number;
  brandPromotionEventId: number;
  imageUrl: string;
  language: GetAdminBrandPromotionEventCouponLanguageDto[];
  status: "NORMAL" | "DELETE";
  createDate: string;
  updateDate: string;
}

export interface PatchAdminBrandPromotionEventCouponRequest {
  brandPromotionEventId: number;
  imageUrl: string;
  language: GetAdminBrandPromotionEventCouponLanguageDto[];
  status: "NORMAL" | "DELETE";
}

/**
 * @description 브랜드 프로모션 등록
 */
export const createBrandPromotion = (
  payload: PostAdminBrandPromotionRequest,
) => {
  return fetcher.post<ApiResponse<void>>(`/admin/brand/promotion`, payload);
};

/**
 * @description 브랜드 프로모션 리스트 조회
 */
export const getBrandPromotionList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionResponse>>
  >(`/admin/brand/promotion`, { params });
};

/**
 * @description 브랜드 프로모션 상세 조회
 */
export const getBrandPromotionDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionDetailResponse>>(
    `/admin/brand/promotion/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 삭제
 */
export const deleteBrandPromotion = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(`/admin/brand/promotion/${id}`);
};

/**
 * @description 브랜드 프로모션 섹션 등록
 */
export const createBrandPromotionSection = (
  payload: PostAdminBrandPromotionSectionRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/section`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 섹션 리스트 조회
 */
export const getBrandPromotionSectionList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
  brandPromotionId?: number;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionSectionResponse>>
  >(`/admin/brand/promotion/section`, { params });
};

/**
 * @description 브랜드 프로모션 섹션 상세 조회
 */
export const getBrandPromotionSectionDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionSectionDetailResponse>>(
    `/admin/brand/promotion/section/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 섹션 수정
 */
export const updateBrandPromotionSection = (
  id: number,
  payload: PatchAdminBrandPromotionSectionRequest,
) => {
  return fetcher.patch<ApiResponse<void>>(
    `/admin/brand/promotion/section/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 섹션 삭제
 */
export const deleteBrandPromotionSection = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(
    `/admin/brand/promotion/section/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 배너 등록
 */
export const createBrandPromotionBanner = (
  payload: PostAdminBrandPromotionBannerRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/banner`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 배너 리스트 조회
 */
export const getBrandPromotionBannerList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
  brandPromotionId?: number;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionBannerResponse>>
  >(`/admin/brand/promotion/banner`, { params });
};

/**
 * @description 브랜드 프로모션 배너 상세 조회
 */
export const getBrandPromotionBannerDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionBannerDetailResponse>>(
    `/admin/brand/promotion/banner/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 배너 수정
 */
export const patchBrandPromotionBanner = (
  id: number,
  payload: PatchAdminBrandPromotionBannerRequest,
) => {
  return fetcher.patch<ApiResponse<void>>(
    `/admin/brand/promotion/banner/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 배너 삭제
 */
export const deleteBrandPromotionBanner = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(
    `/admin/brand/promotion/banner/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 공지 등록
 */
export const createBrandPromotionNotics = (
  payload: PostAdminBrandPromotionNoticsRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/notics`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 공지 리스트 조회
 */
export const getBrandPromotionNoticsList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionNoticsResponse>>
  >(`/admin/brand/promotion/notics`, { params });
};

/**
 * @description 브랜드 프로모션 공지 상세 조회
 */
export const getBrandPromotionNoticsDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionNoticsDetailResponse>>(
    `/admin/brand/promotion/notics/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 공지 수정
 */
export const updateBrandPromotionNotics = (
  id: number,
  payload: PatchAdminBrandPromotionNoticsRequest,
) => {
  return fetcher.patch<ApiResponse<void>>(
    `/admin/brand/promotion/notics/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 공지 삭제
 */
export const deleteBrandPromotionNotics = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(
    `/admin/brand/promotion/notics/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 팝업 등록
 */
export const createBrandPromotionPopup = (
  payload: PostAdminBrandPromotionPopupRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/popup`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 팝업 리스트 조회
 */
export const getBrandPromotionPopupList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
  brandPromotionId?: number;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionPopupResponse>>
  >(`/admin/brand/promotion/popup`, { params });
};

/**
 * @description 브랜드 프로모션 팝업 상세 조회
 */
export const getBrandPromotionPopupDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionPopupDetailResponse>>(
    `/admin/brand/promotion/popup/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 팝업 수정
 */
export const patchBrandPromotionPopup = (
  id: number,
  payload: PatchAdminBrandPromotionPopupRequest,
) => {
  return fetcher.patch<ApiResponse<void>>(
    `/admin/brand/promotion/popup/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 팝업 삭제
 */
export const deleteBrandPromotionPopup = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(
    `/admin/brand/promotion/popup/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 등록
 */
export const createBrandPromotionEvent = (
  payload: PostAdminBrandPromotionEventRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/event`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 리스트 조회
 */
export const getBrandPromotionEventList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
  brandPromotionId?: number;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionEventResponse>>
  >(`/admin/brand/promotion/event`, { params });
};

/**
 * @description 브랜드 프로모션 이벤트 상세 조회
 */
export const getBrandPromotionEventDetail = (id: number) => {
  return fetcher.get<ApiResponse<GetAdminBrandPromotionEventDetailResponse>>(
    `/admin/brand/promotion/event/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 수정
 */
export const patchBrandPromotionEvent = (
  id: number,
  payload: PatchAdminBrandPromotionEventRequest,
) => {
  return fetcher.patch<ApiResponse<GetAdminBrandPromotionEventDetailResponse>>(
    `/admin/brand/promotion/event/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 삭제
 */
export const deleteBrandPromotionEvent = (id: number) => {
  return fetcher.delete<ApiResponse<GetAdminBrandPromotionEventDetailResponse>>(
    `/admin/brand/promotion/event/${id}`,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 쿠폰 등록
 */
export const createBrandPromotionEventCoupon = (
  payload: PostAdminBrandPromotionEventCouponRequest,
) => {
  return fetcher.post<ApiResponse<void>>(
    `/admin/brand/promotion/event/coupon`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 쿠폰 리스트 조회
 */
export const getBrandPromotionEventCouponList = (params?: {
  page?: number;
  count?: number;
  search?: string;
  sort?: string;
  brandPromotionEventId?: number;
}) => {
  return fetcher.get<
    ApiResponse<PaginatedData<GetAdminBrandPromotionEventCouponResponse>>
  >(`/admin/brand/promotion/event/coupon`, { params });
};

/**
 * @description 브랜드 프로모션 이벤트 쿠폰 상세 조회
 */
export const getBrandPromotionEventCouponDetail = (id: number) => {
  return fetcher.get<
    ApiResponse<GetAdminBrandPromotionEventCouponDetailResponse>
  >(`/admin/brand/promotion/event/coupon/${id}`);
};

/**
 * @description 브랜드 프로모션 이벤트 쿠폰 수정
 */
export const patchBrandPromotionEventCoupon = (
  id: number,
  payload: PatchAdminBrandPromotionEventCouponRequest,
) => {
  return fetcher.patch<ApiResponse<void>>(
    `/admin/brand/promotion/event/coupon/${id}`,
    payload,
  );
};

/**
 * @description 브랜드 프로모션 이벤트 쿠폰 삭제
 */
export const deleteBrandPromotionEventCoupon = (id: number) => {
  return fetcher.delete<ApiResponse<void>>(
    `/admin/brand/promotion/event/coupon/${id}`,
  );
};
