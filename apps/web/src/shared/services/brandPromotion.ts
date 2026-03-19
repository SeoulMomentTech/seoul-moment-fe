import type { LanguageType } from "@/i18n/const";

import { type CommonRes, api } from ".";

export interface GetBrandPromotionBrandResponse {
  /** 브랜드 프로모션 아이디 */
  id: number;
  /** 브랜드 아이디 */
  brandId: number;
  /** 브랜드 프로필 이미지 URL */
  profileImageUrl: string;
  /** 브랜드 이름 */
  name: string;
}

export interface GetBrandPromotionBrandListResponse {
  /** 전체 개수 */
  total: number;
  /** 브랜드 프로모션 목록 */
  list: GetBrandPromotionBrandResponse[];
}

export interface GetBrandPromotionBannerResponse {
  /** 브랜드 프로모션 배너 아이디 */
  id: number;
  /** 배너 이미지 경로 */
  imageUrl: string;
  /** 모바일 배너 이미지 경로 */
  mobileImageUrl: string;
  /** 배너 링크 URL */
  linkUrl: string;
  /** 배너 제목 */
  title: string;
}

export interface GetBrandPromotionBrandDetailResponse {
  /** 브랜드 아이디 */
  id: number;
  /** 브랜드 이름 */
  name: string;
  /** 브랜드 프로필 이미지 URL */
  profileImageUrl: string;
  /** 브랜드 설명 */
  description: string;
  /** 브랜드 좋아요 수 */
  likeCount: number;
  /** 브랜드 색상 */
  colorCode: string;
}

export type BrandSectionType =
  | "TYPE_1"
  | "TYPE_2"
  | "TYPE_3"
  | "TYPE_4"
  | "TYPE_5";

export interface GetBrandPromotionSectionResponse {
  /** 브랜드 프로모션 섹션 아이디 */
  id: number;
  /** 브랜드 프로모션 섹션 타입 */
  type: BrandSectionType;
  /** 제목 */
  title: string;
  /** 브랜드 프로모션 섹션 이미지 경로 리스트 */
  imageUrlList: string[];
}

export interface GetBrandPromotionProductResponse {
  /** 상품 아이디 */
  id: number;
  /** 브랜드 이름 */
  brandName: string;
  /** 상품 이름 */
  productName: string;
  /** 가격 (할인 가격이 있으면 할인가격 보여줌) */
  price: number;
  /** 좋아요 수 */
  like: number;
  /** 리뷰 수 */
  review: number;
  /** 별점 평균 */
  reviewAverage: number;
  /** 상품이미지 */
  imageUrl: string;
}

export interface GetBrandPromotionPopupResponse {
  /** 브랜드 프로모션 팝업 아이디 */
  id: number;
  /** 장소 */
  place: string;
  /** 주소 */
  address: string;
  /** 위도 */
  latitude: string;
  /** 경도 */
  longitude: string;
  /** 시작일 */
  startDate: string;
  /** 시작 시간 */
  startTime: string;
  /** 종료일, null일 경우 상시 진행 */
  endDate?: string;
  /** 종료 시간 */
  endTime?: string;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 이미지 경로 리스트 */
  imageUrlList: string[];
}

export interface GetBrandPromotionEventCouponResponse {
  /** 브랜드 프로모션 이벤트 쿠폰 아이디 */
  id: number;
  /** 쿠폰 이미지 경로 */
  imageUrl: string;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 쿠폰 상태 */
  status: string;
}

export interface GetBrandPromotionEventAndCouponResponse {
  /** 브랜드 프로모션 이벤트 아이디 */
  id: number;
  /** 제목 */
  title: string;
  /** 쿠폰 목록 */
  couponList: GetBrandPromotionEventCouponResponse[];
}

export interface GetBrandPromotionNoticsResponse {
  /** 브랜드 프로모션 공지 아이디 */
  id: number;
  /** 내용 */
  content: string;
}

export interface GetBrandPromotionResponse {
  /** 브랜드 프로모션 배너 목록 */
  bannerList: GetBrandPromotionBannerResponse[];
  /** 브랜드 정보 */
  brand: GetBrandPromotionBrandDetailResponse;
  /** 브랜드 프로모션 섹션 목록 */
  sectionList: GetBrandPromotionSectionResponse[];
  /** 브랜드 프로모션 상품 목록 */
  productList: GetBrandPromotionProductResponse[];
  /** 브랜드 프로모션 팝업 목록 */
  popupList: GetBrandPromotionPopupResponse[];
  /** 브랜드 프로모션 이벤트 목록 */
  eventList: GetBrandPromotionEventAndCouponResponse[];
  /** 브랜드 프로모션 공지 목록 */
  noticeList: GetBrandPromotionNoticsResponse[];
}

/**
 * @description 브랜드 프로모션 리스트 조회
 */
export const getBrandPromotionList = () =>
  api
    .get("brand/promotion/brand")
    .json<CommonRes<GetBrandPromotionBrandListResponse>>();

/**
 * @description 브랜드 프로모션 상세 조회
 */
export const getBrandPromotionDetail = (
  brandId: number,
  languageCode: LanguageType,
) =>
  api
    .get(`brand/promotion/${brandId}`, {
      headers: {
        "Accept-language": languageCode,
      },
    })
    .json<CommonRes<GetBrandPromotionResponse>>();
