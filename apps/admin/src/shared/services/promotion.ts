import type { ApiResponse } from './types';

import { fetcher } from '.';

export interface PostAdminPromotionLanguageDto {
  /** 언어 아이디 */
  languageId: number;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
}

export interface PostAdminPromotionRequest {
  /** 배너 이미지 경로 */
  bannerImagePath: string;
  /** 모바일 배너 이미지 경로 */
  bannerMobileImagePath: string;
  /** 썸네일 이미지 경로 */
  thumbnailImagePath: string;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
  /** 활성 여부 */
  isActive: boolean;
  /** 언어별 내용 */
  language: PostAdminPromotionLanguageDto[];
}

export interface GetAdminPromotionLanguageDto {
  /** 언어 코드 */
  languageCode: 'ko' | 'en' | 'zh-TW';
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
}

export interface GetAdminPromotionResponse {
  /** 프로모션 아이디 */
  id: number;
  /** 배너 이미지 주소 */
  bannerImageUrl: string;
  /** 모바일 배너 이미지 주소 */
  bannerMobileImageUrl: string;
  /** 썸네일 이미지 주소 */
  thumbnailImageUrl: string;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
  /** 활성 여부 */
  isActive: boolean;
  /** 언어별 내용 */
  language: GetAdminPromotionLanguageDto[];
  /** 생성일 */
  createDate: string;
  /** 수정일 */
  updateDate: string;
}

export interface GetAdminPromotionDetailResponse {
  /** 프로모션 아이디 */
  id: number;
  /** 배너 이미지 주소 */
  bannerImageUrl: string;
  /** 모바일 배너 이미지 주소 */
  bannerMobileImageUrl: string;
  /** 썸네일 이미지 주소 */
  thumbnailImageUrl: string;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
  /** 활성 여부 */
  isActive: boolean;
  /** 언어별 내용 */
  language: GetAdminPromotionLanguageDto[];
  /** 생성일 */
  createDate: string;
  /** 수정일 */
  updateDate: string;
}

export interface PatchAdminPromotionRequest {
  /** 배너 이미지 주소 */
  bannerImageUrl: string;
  /** 모바일 배너 이미지 주소 */
  bannerMobileImageUrl: string;
  /** 썸네일 이미지 주소 */
  thumbnailImageUrl: string;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
  /** 활성 여부 */
  isActive: boolean;
  /** 언어별 내용 */
  language: GetAdminPromotionLanguageDto[];
}

export interface GetAdminPromotionListParams {
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  count?: number;
  /** 검색 */
  search?: string;
  /** 정렬 방식 */
  sort?: 'ASC' | 'DESC';
}

export interface GetAdminPromotionListResponse {
  total: number;
  list: GetAdminPromotionResponse[];
}

/**
 * @description 프로모션 등록
 */
export const createAdminPromotion = (data: PostAdminPromotionRequest) =>
  fetcher.post<ApiResponse<void>>('/admin/promotion', data);

/**
 * @description 프로모션 리스트 조회
 */
export const getAdminPromotionList = (params?: GetAdminPromotionListParams) =>
  fetcher.get<ApiResponse<GetAdminPromotionListResponse>>('/admin/promotion', { params });

/**
 * @description 프로모션 상세 조회
 */
export const getAdminPromotionDetail = (id: number) =>
  fetcher.get<ApiResponse<GetAdminPromotionDetailResponse>>(`/admin/promotion/${id}`);

/**
 * @description 프로모션 수정
 */
export const updateAdminPromotion = (id: number, data: PatchAdminPromotionRequest) =>
  fetcher.patch<ApiResponse<void>>(`/admin/promotion/${id}`, data);

/**
 * @description 프로모션 삭제
 */
export const deleteAdminPromotion = (id: number) =>
  fetcher.delete<ApiResponse<void>>(`/admin/promotion/${id}`);
