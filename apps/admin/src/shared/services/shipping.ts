import { type ApiResponse } from "./types";

import { fetcher } from ".";

export type AdminShippingRemoteAreaId = Branded<
  number,
  "AdminShippingRemoteAreaId"
>;

export interface AdminShippingPolicy {
  /** 본섬 배송비 */
  baseFee: number;
  /** 외섬 정상 배송비 */
  remoteIslandFee: number;
  /** 외섬 프로모션 여부. true 면 외섬에도 baseFee 를 적용한다 */
  remoteIslandPromotion: boolean;
  /** 무료배송 임계금액 */
  freeShippingThreshold: number;
  /** 국제배송비 지원 할인 ON/OFF. NT$4,000 이상 120/250/450/700 (구간별 하나) */
  internationalDiscountEnabled: boolean;
}

/** 보낸 필드만 바뀐다. 이미 생성된 주문 금액은 스냅샷이라 영향이 없다 */
export interface PatchAdminShippingPolicyRequest {
  baseFee?: number;
  /** 외섬 정상 배송비. 프로모션가로 덮어쓰지 말 것 */
  remoteIslandFee?: number;
  /** 외섬 프로모션 종료는 이 값을 false 로 바꾸면 된다 */
  remoteIslandPromotion?: boolean;
  freeShippingThreshold?: number;
  /** 국제배송비 지원 할인 켜기/끄기. 무료배송 임계금액은 freeShippingThreshold 로 따로 맞춘다 */
  internationalDiscountEnabled?: boolean;
}

export interface AdminShippingRemoteArea {
  id: AdminShippingRemoteAreaId;
  /** 縣市 */
  city: string;
  /** 區/鄉. null 이면 해당 縣 전체가 외섬이다 */
  district: string | null;
  /** 판정에 사용할지 여부 */
  isActive: boolean;
}

export interface GetAdminShippingRemoteAreaListResponse {
  total: number;
  list: AdminShippingRemoteArea[];
}

export interface PostAdminShippingRemoteAreaRequest {
  /** 縣市 */
  city: string;
  /** 區/鄉. 생략하면 해당 縣 전체가 외섬이 된다. 綠島鄉·蘭嶼鄉 처럼 縣 일부만 외섬일 때 지정한다 */
  district?: string;
  isActive?: boolean;
}

/**
 * @description 배송비 정책 조회
 * Swagger: AdminShippingController_getAdminShippingPolicy
 */
export const getAdminShippingPolicy = () =>
  fetcher.get<ApiResponse<AdminShippingPolicy>>("/admin/shipping/policy");

/**
 * @description 배송비 정책 수정. 이미 생성된 주문의 금액은 바뀌지 않는다
 * Swagger: AdminShippingController_patchAdminShippingPolicy
 */
export const updateAdminShippingPolicy = (
  payload: PatchAdminShippingPolicyRequest,
) => fetcher.patch("/admin/shipping/policy", payload);

/**
 * @description 외섬 지역 목록 조회
 * Swagger: AdminShippingController_getAdminShippingRemoteAreaList
 */
export const getAdminShippingRemoteAreaList = () =>
  fetcher.get<ApiResponse<GetAdminShippingRemoteAreaListResponse>>(
    "/admin/shipping/remote-area",
  );

/**
 * @description 외섬 지역 추가. 이미 등록된 지역이면 409
 * Swagger: AdminShippingController_postAdminShippingRemoteArea
 */
export const createAdminShippingRemoteArea = (
  payload: PostAdminShippingRemoteAreaRequest,
) => fetcher.post("/admin/shipping/remote-area", payload);

/**
 * @description 외섬 지역 삭제
 * Swagger: AdminShippingController_deleteAdminShippingRemoteArea
 */
export const deleteAdminShippingRemoteArea = (
  remoteAreaId: AdminShippingRemoteAreaId,
) => fetcher.delete(`/admin/shipping/remote-area/${remoteAreaId}`);
