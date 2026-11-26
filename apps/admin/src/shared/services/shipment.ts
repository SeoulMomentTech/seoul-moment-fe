import { type AdminOrderDeliveryStage, type AdminOrderId } from "./order";
import { type ApiResponse } from "./types";

import { fetcher } from ".";

export type AdminShipmentId = Branded<number, "AdminShipmentId">;

/** 통관 상태. WAITING 대기 / IN_PROGRESS 진행 / HELD 보류 / CLEARED 완료. 배송 단계와 따로다 */
export type AdminShipmentCustomsStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "HELD"
  | "CLEARED";

/** 국제배송 묶음 (박스 1개). 국제운송장·수입신고번호는 주문이 아니라 묶음에 있다 */
export interface AdminShipment {
  shipmentId: AdminShipmentId;
  intlCarrier: string | null;
  intlTrackingNo: string | null;
  /** 분할운송장(HAWB) 번호 */
  houseAirwaybillNo: string | null;
  /** 법인 수입신고번호 */
  importDeclarationNo: string | null;
  customsStatus: AdminShipmentCustomsStatus;
  /** 수입신고 일시 */
  declaredAt: string | null;
  /** 통관 완료 일시 */
  clearedAt: string | null;
  /** 담당자 메모 (고객 비노출) */
  memo: string | null;
  /** 마지막으로 고친 관리자 */
  updatedByAdminId: number | null;
  updatedAt: string;
}

/** 묶음에 실린 주문 */
export interface AdminShipmentOrder {
  orderId: AdminOrderId;
  orderNumber: string;
  recipientName: string | null;
  /** 주문 상태 코드 */
  status: string;
  deliveryStage: AdminOrderDeliveryStage;
  deliveryStageLabel: string;
  /** 대만 국내운송장 */
  localTrackingNo: string | null;
}

export interface AdminShipmentDetail extends AdminShipment {
  orders: AdminShipmentOrder[];
}

export interface GetAdminShipmentListParams {
  page?: number;
  /** 페이지 크기 (최대 100) */
  count?: number;
  /** 국제운송장·분할운송장·수입신고번호·주문번호·대만 운송장 */
  search?: string;
  customsStatus?: AdminShipmentCustomsStatus;
}

export interface GetAdminShipmentListResponse {
  total: number;
  list: AdminShipmentDetail[];
}

export interface PostAdminShipmentRequest {
  /** 실린 주문 ID (1~200개). 결제 완료 주문만 넣을 수 있고 한 주문이 여러 묶음에 들어가도 된다 */
  orderIds: AdminOrderId[];
  intlCarrier?: string;
  /** 국제운송장 번호. 수입신고번호와 같은 값이면 400 */
  intlTrackingNo?: string;
  houseAirwaybillNo?: string;
  importDeclarationNo?: string;
  /** 생략하면 WAITING. 배송 단계를 바꾸지 않는다 */
  customsStatus?: AdminShipmentCustomsStatus;
  /** ISO 8601 */
  declaredAt?: string;
  /** ISO 8601 */
  clearedAt?: string;
  /** 1000자 */
  memo?: string;
}

/**
 * 보낸 필드만 고친다. 글자 필드는 빈 문자열·null, 날짜 필드는 null 이면 지운다.
 * orderIds 를 보내면 실린 주문을 통째로 바꾼다
 */
export interface PatchAdminShipmentRequest {
  orderIds?: AdminOrderId[];
  intlCarrier?: string | null;
  intlTrackingNo?: string | null;
  houseAirwaybillNo?: string | null;
  importDeclarationNo?: string | null;
  customsStatus?: AdminShipmentCustomsStatus;
  declaredAt?: string | null;
  clearedAt?: string | null;
  memo?: string | null;
}

/** 다른 묶음과 번호가 겹쳐도 저장은 되고, 겹친 묶음 ID 를 경고로 알려 준다 */
export interface PostAdminShipmentResponse {
  shipmentId: AdminShipmentId;
  sameIntlTrackingNoShipmentIds: AdminShipmentId[];
  sameImportDeclarationNoShipmentIds: AdminShipmentId[];
}

/**
 * @description 통관·물류 목록. 최근 등록순
 * Swagger: AdminShipmentController_getAdminShipmentList
 */
export const getAdminShipmentList = (params?: GetAdminShipmentListParams) =>
  fetcher.get<ApiResponse<GetAdminShipmentListResponse>>("/admin/shipment", {
    params,
  });

/**
 * @description 통관·물류 상세
 * Swagger: AdminShipmentController_getAdminShipment
 */
export const getAdminShipmentDetail = (shipmentId: AdminShipmentId) =>
  fetcher.get<ApiResponse<AdminShipmentDetail>>(
    `/admin/shipment/${shipmentId}`,
  );

/**
 * @description 통관·물류 등록 (국제배송 묶음). 통관 상태를 넣어도 주문의 배송 단계는 바뀌지 않는다
 * Swagger: AdminShipmentController_postAdminShipment
 */
export const createAdminShipment = (payload: PostAdminShipmentRequest) =>
  fetcher.post<ApiResponse<PostAdminShipmentResponse>>(
    "/admin/shipment",
    payload,
  );

/**
 * @description 통관·물류 수정. 고칠 때마다 실린 주문의 작업 이력에 한 줄이 쌓인다
 * Swagger: AdminShipmentController_patchAdminShipment
 */
export const updateAdminShipment = (
  shipmentId: AdminShipmentId,
  payload: PatchAdminShipmentRequest,
) =>
  fetcher.patch<ApiResponse<PostAdminShipmentResponse>>(
    `/admin/shipment/${shipmentId}`,
    payload,
  );

/**
 * @description 통관·물류 삭제. 실린 주문의 작업 이력에 한 줄이 남고, 배송 단계·대만 운송장은 바뀌지 않는다.
 * 되돌리는 API 는 없다 — 다시 등록한다
 * Swagger: AdminShipmentController_deleteAdminShipment
 */
export const deleteAdminShipment = (shipmentId: AdminShipmentId) =>
  fetcher.delete(`/admin/shipment/${shipmentId}`);
