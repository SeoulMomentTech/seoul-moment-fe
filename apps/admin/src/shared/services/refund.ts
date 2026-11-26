import {
  type AdminOrderId,
  type AdminOrderInvoiceStatus,
  type AdminOrderPaymentMethod,
} from "./order";
import { type ApiResponse } from "./types";

import { fetcher } from ".";

/** super_admin 전용 API 의 403 은 권한 부족이라 로그아웃하지 않는다 */
const SUPER_ADMIN_ONLY = { skipForbiddenLogout: true } as const;

export type AdminRefundId = Branded<number, "AdminRefundId">;

/**
 * REQUESTED 요청됨(수동 환불은 완료 입력 대기) / PROCESSING PG 결과 미확인 — 다시 시도 필요 /
 * COMPLETED 완료 / FAILED PG 거절
 */
export type AdminRefundStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/** 환불 뒤 발표 정정 상태. NONE 없음 / PENDING 대기 / VOIDED 作廢 / ALLOWANCED 折讓 / FAILED 실패 */
export type AdminInvoiceAdjustStatus =
  | "NONE"
  | "PENDING"
  | "VOIDED"
  | "ALLOWANCED"
  | "FAILED";

export interface AdminRefund {
  refundId: AdminRefundId;
  orderId: AdminOrderId;
  /** 원 결제 수단 */
  method: AdminOrderPaymentMethod;
  /** 이 환불의 금액 NT$. 결제 금액보다 작으면 부분 환불 */
  amount: number;
  status: AdminRefundStatus;
  /** true 면 PG 환불 API 를 쓰지 않는다. 직접 환불한 뒤 완료를 입력한다 */
  isManual: boolean;
  reason: string | null;
  /** LINE Pay 환불 거래번호. 수동 환불이면 입력한 참조번호 */
  pgRefundId: string | null;
  /** PG 환불 요청 횟수 */
  attemptCount: number;
  failureCode: string | null;
  failureMessage: string | null;
  /** 환불을 시작한 관리자. null 이면 24시간 안 · 발주 전 취소로 시스템이 시작한 자동 환불 */
  adminId: number | null;
  requestedAt: string;
  completedAt: string | null;
}

/** 전자발표 정정(作廢·折讓). 환불 결과와 따로 본다 */
export interface AdminInvoiceAdjustment {
  /** PENDING·FAILED 면 발행된 적이 없다 (未開立) */
  invoiceStatus: AdminOrderInvoiceStatus;
  invoiceNo: string | null;
  adjustStatus: AdminInvoiceAdjustStatus;
  /** 折讓單 번호 */
  allowanceNo: string | null;
  adjustedAt: string | null;
  attemptCount: number;
  failureCode: string | null;
  failureMessage: string | null;
}

export interface GetAdminRefundListParams {
  page?: number;
  /** 페이지 크기 (최대 100) */
  count?: number;
  status?: AdminRefundStatus;
}

export interface AdminRefundListItem extends AdminRefund {
  orderNumber: string | null;
  recipientName: string | null;
  /** 취소·계약해제 통지 접수 시각 */
  cancellationRequestedAt: string | null;
  /** 발표 행이 없는 주문이면 null */
  invoiceAdjustment: AdminInvoiceAdjustment | null;
}

export interface GetAdminRefundListResponse {
  total: number;
  list: AdminRefundListItem[];
}

export interface PostAdminOrderRefundRequest {
  /** 환불 근거 (500자). 새 환불을 시작할 때만 저장되고 재시도에서는 무시된다 */
  reason?: string;
  /** 환불 금액 NT$ (정수, 1 이상). 생략하면 남은 금액 전부. refundableAmount 를 넘으면 400 */
  amount?: number;
}

export interface PostAdminOrderRefundCompleteRequest {
  /** 실제로 돈을 돌려준 근거 (100자). ECPay 後台 退刷 처리번호, 송금 참조번호 등 */
  reference: string;
}

/**
 * @description 취소/환불 관리 목록. 시작된 환불을 최근순으로. 환불을 시작하지 않은 취소 신청은
 * 주문 목록의 chip=CANCEL_REQUESTED 에 있다
 * Swagger: AdminRefundController_getAdminRefundList
 */
export const getAdminRefundList = (params?: GetAdminRefundListParams) =>
  fetcher.get<ApiResponse<GetAdminRefundListResponse>>("/admin/refund", {
    params,
  });

/**
 * @description 환불 실행 (전액 · 부분) · 재시도. super_admin 전용. 끝나지 않은 환불이 있으면
 * 새로 만들지 않고 그 환불을 다시 시도한다
 * Swagger: AdminRefundController_postAdminOrderRefund
 */
export const createAdminOrderRefund = (
  orderId: AdminOrderId,
  payload: PostAdminOrderRefundRequest,
) =>
  fetcher.post<ApiResponse<AdminRefund>>(
    `/admin/order/${orderId}/refund`,
    payload,
    SUPER_ADMIN_ONLY,
  );

/**
 * @description 끝나지 않은 환불 요청 취소 (REQUESTED · FAILED). super_admin 전용.
 * 결과 미확인(PROCESSING)·완료된 환불은 409
 * Swagger: AdminRefundController_deleteAdminOrderRefund
 */
export const deleteAdminOrderRefund = (orderId: AdminOrderId) =>
  fetcher.delete(`/admin/order/${orderId}/refund`, SUPER_ADMIN_ONLY);

/**
 * @description 수동 환불 완료 입력. super_admin 전용. 돈을 보내지 않고 PG 밖에서 돌려준
 * 환불의 완료만 기록한다
 * Swagger: AdminRefundController_postAdminOrderRefundComplete
 */
export const completeAdminOrderRefund = (
  orderId: AdminOrderId,
  payload: PostAdminOrderRefundCompleteRequest,
) =>
  fetcher.post<ApiResponse<AdminRefund>>(
    `/admin/order/${orderId}/refund/complete`,
    payload,
    SUPER_ADMIN_ONLY,
  );

/**
 * @description 전자발표 정정 재시도 (作廢·折讓). super_admin 전용. 환불은 다시 하지 않는다.
 * adjustStatus 가 FAILED·PENDING 으로 남았을 때 쓴다
 * Swagger: AdminRefundController_postAdminOrderInvoiceAdjust
 */
export const retryAdminOrderInvoiceAdjustment = (orderId: AdminOrderId) =>
  fetcher.post<ApiResponse<AdminInvoiceAdjustment>>(
    `/admin/order/${orderId}/invoice-adjust`,
    undefined,
    SUPER_ADMIN_ONLY,
  );
