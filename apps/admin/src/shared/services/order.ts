import {
  type AdminInvoiceAdjustment,
  type AdminInvoiceAdjustStatus,
  type AdminRefund,
  type AdminRefundStatus,
} from "./refund";
import { type AdminShipment } from "./shipment";
import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminOrderId = Branded<number, "AdminOrderId">;

/**
 * 목록 필터 칩. KPI 와 같은 기준이다.
 * ALL 전체 / WAITING 24시간 대기 중 / READY 발주 가능 / CANCEL_REQUESTED 취소 요청 / ORDERED 발주 완료
 */
export type AdminOrderChip =
  | "ALL"
  | "WAITING"
  | "READY"
  | "CANCEL_REQUESTED"
  | "ORDERED";

/** 배송 6단계. 결제·취소·환불 상태와 독립이다 */
export type AdminOrderDeliveryStage =
  | "ORDER_CONFIRMED"
  | "PREPARING_ORDER"
  | "INTERNATIONAL_SHIPPING"
  | "ARRIVED_TAIWAN"
  | "LOCAL_DELIVERY"
  | "DELIVERED";

/**
 * 24시간 타이머 상태. 행 색을 이 값으로 정한다
 * (WAITING 흰색/연한 파랑, SOON 연한 주황, READY 연한 초록, CANCEL_REQUESTED 연한 분홍)
 */
export type AdminOrderTimerState =
  | "NOT_PAID"
  | "WAITING"
  | "SOON"
  | "READY"
  | "ORDERED"
  | "CANCEL_REQUESTED";

export type AdminOrderPurchaseStatus = "NOT_ORDERED" | "ORDERED";

export type AdminOrderPaymentMethod = "LINE_PAY" | "ECPAY";

export interface GetAdminOrderListParams {
  page?: number;
  /** 페이지 크기 (최대 100) */
  count?: number;
  /** 주문번호·받는 분·상품명 */
  search?: string;
  sort?: SortDirection;
  /** 기본값 ALL */
  chip?: AdminOrderChip;
  /** 결제일 시작 (YYYY-MM-DD, Asia/Taipei 날짜, 포함) */
  paidFrom?: string;
  /** 결제일 끝 (YYYY-MM-DD, Asia/Taipei 날짜, 포함) */
  paidTo?: string;
  deliveryStage?: AdminOrderDeliveryStage;
}

/** 주문 목록 행이자 상세의 24시간 타이머. 남은 시간·발주 가능 여부는 서버 시각 기준이다 */
export interface AdminOrderListItem {
  orderId: AdminOrderId;
  orderNumber: string;
  /** 결제 완료 시각 */
  paidAt: string | null;
  /** 받는 분 (고객명) */
  recipientName: string | null;
  /** 실제 결제 금액 NT$ */
  totalAmount: number;
  paymentMethod: AdminOrderPaymentMethod | null;
  timerState: AdminOrderTimerState;
  timerStateLabel: string;
  /** 발주 가능까지 남은 초 (서버 기준, 0이면 경과) */
  remainingSeconds: number;
  /** 발주 가능 시각 */
  readyAt: string | null;
  purchaseStatus: AdminOrderPurchaseStatus;
  supplierOrderedAt: string | null;
  /** 취소·계약해제 통지 접수 여부 */
  cancellationRequested: boolean;
  deliveryStage: AdminOrderDeliveryStage;
  deliveryStageLabel: string;
  /** `한국 발주 시작` 버튼 활성 여부. 정상 발주(24시간 경과) 기준이다 */
  canStartPurchase: boolean;
}

export interface GetAdminOrderListResponse {
  total: number;
  list: AdminOrderListItem[];
}

/** KPI 4개. 서로 겹칠 수 있어 합산하지 않는다 */
export interface GetAdminOrderSummaryResponse {
  /** 오늘 신규: 결제 완료 시각이 오늘(Asia/Taipei)인 건수 */
  todayNew: number;
  /** 24시간 대기 중: 결제 완료·미발주·취소 미접수·24시간 미경과 */
  waiting: number;
  /** 발주 가능: 결제 완료·미발주·취소 미접수·24시간 경과 */
  ready: number;
  /** 취소 요청: 취소·계약해제 통지가 접수된 결제 완료 건수 */
  cancelRequested: number;
  /** 집계 기준 시각 (서버) */
  asOf: string;
}

/**
 * 주문 상태. PENDING 결제 전 / PAYMENT_WAITING ATM·편의점 입금 대기 / PAID 결제 완료 /
 * CANCELED 취소 / FAILED 결제 후 재고 부족 등으로 환불 대상
 */
export type AdminOrderStatus =
  | "PENDING"
  | "PAYMENT_WAITING"
  | "PAID"
  | "CANCELED"
  | "FAILED";

/**
 * 결제 시도 상태. REQUESTED 결제 중 / WAITING_DEPOSIT 입금 대기 / PAID 완료 /
 * FAILED · CANCELED · EXPIRED 결제 안 됨(같은 주문으로 다시 결제 가능)
 */
export type AdminOrderPaymentStatus =
  | "READY"
  | "REQUESTED"
  | "WAITING_DEPOSIT"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

/** ATM 계좌 · 편의점 납부 코드. 입금 대기일 때만 있다 */
export interface AdminOrderDepositInfo {
  /** ECPay 결제수단. ATM_ 으로 시작하면 계좌이체, CVS_ 면 편의점 납부 */
  paymentType: string;
  bankCode?: string;
  account?: string;
  paymentNo?: string;
}

export interface AdminOrderPayment {
  paymentId: number;
  method: AdminOrderPaymentMethod;
  status: AdminOrderPaymentStatus;
  amount: number;
  /** PG 가 알려준 실제 결제수단 (Credit_CreditCard, ATM_LAND …) */
  pgPaymentType: string | null;
  depositInfo: AdminOrderDepositInfo | null;
  /** 입금 기한 (ATM · 편의점) */
  expireAt: string | null;
  paidAt: string | null;
  /** 실패 사유 코드 (PG 응답 코드) */
  failureCode: string | null;
}

/**
 * 전자발표 받는 방법.
 * MEMBER_CARRIER 회원 載具 / MOBILE_BARCODE 휴대폰 바코드 / CITIZEN_CERT 自然人憑證 /
 * DONATION 기부 / COMPANY 회사(統一編號)
 */
export type AdminOrderInvoiceType =
  | "MEMBER_CARRIER"
  | "MOBILE_BARCODE"
  | "CITIZEN_CERT"
  | "DONATION"
  | "COMPANY";

/** 발표 발행 상태. PENDING 결제 전·발행 대기 / ISSUED 발행됨 / FAILED 발행 실패(서버가 다시 시도한다) */
export type AdminOrderInvoiceStatus = "PENDING" | "ISSUED" | "FAILED";

export interface AdminOrderInvoice {
  type: AdminOrderInvoiceType;
  status: AdminOrderInvoiceStatus;
  carrierNum: string | null;
  loveCode: string | null;
  companyTaxId: string | null;
  companyName: string | null;
  /** 발표번호 */
  invoiceNo: string | null;
  invoiceDate: string | null;
  /** 랜덤 번호 4자리 */
  randomNumber: string | null;
  /** 환불 뒤 발표 정정 상태 */
  adjustStatus: AdminInvoiceAdjustStatus;
}

export interface AdminOrderItem {
  orderItemId: number;
  productItemId: number;
  brandId: number;
  /** 주문 시점 브랜드명 */
  brandName: string;
  /** 주문 시점 상품명 */
  productName: string;
  optionText: string;
  /** 주문 시점 이미지 URL */
  imageUrl: string;
  /** 정가 */
  unitPrice: number;
  /** 적용가 */
  unitDiscountPrice: number;
  quantity: number;
  totalPrice: number;
}

/** 편의점 픽업 매장 */
export interface AdminOrderCvsStore {
  logisticsSubType: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  storeTelephone: string | null;
  isOutsideIsland: boolean;
}

/** 배송지. 편의점 픽업(CVS)이면 주소 필드는 null 이고 cvsStore 에 매장이 온다 */
export interface AdminOrderShipping {
  shippingType: "HOME" | "CVS";
  recipientName: string;
  phone: string;
  postalCode: string | null;
  /** 縣市 */
  city: string | null;
  /** 區/鄉 */
  district: string | null;
  detailAddress: string | null;
  requestMessage: string | null;
  cvsStore: AdminOrderCvsStore | null;
}

/** 고객에게 보이는 가장 최근 환불. 전액이 환불되면 주문 status 가 CANCELED 로 바뀐다 */
export interface AdminOrderCustomerRefund {
  /** FAILED 는 고객에게 환불 처리 지연으로 보인다 */
  status: AdminRefundStatus;
  /** 결제 금액보다 작으면 부분 환불 */
  amount: number;
  requestedAt: string;
  completedAt: string | null;
}

/** 고객 주문조회 상세와 같은 내용 (상품·가격내역·배송지·결제·발표) */
export interface AdminOrderCustomerDetail {
  orderId: AdminOrderId;
  orderNumber: string;
  status: AdminOrderStatus;
  paymentMethod: AdminOrderPaymentMethod;
  totalProductAmount: number;
  /** 청구된 배송비 */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** 주문 시점의 무료배송 임계금액 */
  freeShippingThreshold: number;
  /** 국제배송비 지원 할인액 스냅샷(NT$). 없으면 0 */
  internationalDiscount: number;
  /** 최종 결제 금액 */
  totalAmount: number;
  statusLabel: string;
  deliveryStage: AdminOrderDeliveryStage;
  deliveryStageLabel: string;
  /** 진행바 위치 (1~6) */
  deliveryStep: number;
  orderedAt: string;
  paidAt: string | null;
  /** 실제 수령·배송 완료 시각. 배송 완료 전이면 null */
  deliveredAt: string | null;
  /** 대만 국내운송사 */
  localCarrier: string | null;
  /** 대만 국내운송장 번호 */
  localTrackingNo: string | null;
  /** 취소·계약해제 신청 버튼 노출 여부. 이미 접수했으면 false */
  canRequestCancel: boolean;
  /** 24시간 간편취소 구간인지 (서버 시각 기준). 안내 문구만 바꾸는 값이다 */
  isQuickCancelPeriod: boolean;
  /** 간편취소 구간이 끝나는 시각 (결제 완료 + 24시간) */
  quickCancelUntil: string | null;
  /** 취소·계약해제를 접수한 시각. 접수 전이면 null */
  cancellationRequestedAt: string | null;
  /** 가장 최근 결제 시도. 결제를 시작하기 전이면 null */
  payment: AdminOrderPayment | null;
  /** 가장 최근 환불. 환불이 시작되지 않았으면 null */
  refund: AdminOrderCustomerRefund | null;
  /** 환불이 완료된 합계 NT$. 없으면 0 */
  refundedAmount: number;
  /** 전자발표. 결제가 확정되면 invoiceNo 가 채워진다 */
  invoice: AdminOrderInvoice | null;
  items: AdminOrderItem[];
  shipping: AdminOrderShipping;
}

/** 발주·매입 */
export interface AdminOrderPurchase {
  purchaseStatus: AdminOrderPurchaseStatus;
  supplierOrderedAt: string | null;
  supplierOrderNo: string | null;
  /** 24시간 전에 조기 발주한 사유. 정상 발주면 null */
  purchaseOverrideReason: string | null;
  /** 발주 처리한 관리자 ID */
  purchasedByAdminId: number | null;
}

/** 통관·배송 탭 */
export interface AdminOrderDelivery {
  deliveryStage: AdminOrderDeliveryStage;
  deliveryStageLabel: string;
  /** 진행바 위치 (1~6) */
  deliveryStep: number;
  /** 실제 수령·배송 완료 시각. 법정 기간 계산의 기준이다 */
  deliveredAt: string | null;
  localCarrier: string | null;
  localTrackingNo: string | null;
  /** 이 주문이 실린 국제배송 묶음. 없으면 빈 배열 */
  shipments: AdminShipment[];
}

/** 취소·환불 탭 중 취소 접수 */
export interface AdminOrderCancellation {
  /** 취소·계약해제 통지를 접수한 시각. 접수 전이면 null */
  requestedAt: string | null;
  /** 고객이 적은 사유 */
  reason: string | null;
  /** 결제 후 24시간 안에 접수됐는지. 접수 전이면 null. false 여도 법정 계약해제 통지로 처리한다 */
  withinQuickCancelPeriod: boolean | null;
}

export type AdminOrderEventType =
  | "CANCEL_REQUESTED"
  | "CANCEL_REQUEST_WITHDRAWN"
  | "PURCHASED"
  | "DELIVERY_STAGE_CHANGED"
  | "LOCAL_DELIVERY_UPDATED"
  | "SHIPMENT_UPDATED"
  | "REFUND_REQUESTED"
  | "REFUND_COMPLETED"
  | "REFUND_FAILED"
  | "REFUND_CANCELED"
  | "INVOICE_ADJUSTED"
  | "INVOICE_ADJUST_FAILED";

/** 작업 이력 */
export interface AdminOrderEvent {
  eventId: number;
  type: AdminOrderEventType;
  /** 처리한 관리자 ID */
  adminId: number | null;
  /** 요청한 고객 ID */
  userId: number | null;
  /** 무엇이 어떻게 바뀌었는지 */
  message: string | null;
  createdAt: string;
}

export interface GetAdminOrderDetailResponse {
  order: AdminOrderCustomerDetail;
  purchase: AdminOrderPurchase;
  timer: AdminOrderListItem;
  delivery: AdminOrderDelivery;
  cancellation: AdminOrderCancellation;
  /** 최신순 */
  events: AdminOrderEvent[];
  /** 가장 최근 환불. 끝나지 않은 환불(재시도·완료 입력 대상)이 있으면 그 환불이다 */
  refund: AdminRefund | null;
  /** 이 주문의 환불 전부 (오래된 순). 부분 환불이면 여러 건이다 */
  refunds: AdminRefund[];
  /** 환불이 완료된 합계 NT$ */
  refundedAmount: number;
  /** 앞으로 환불할 수 있는 금액 NT$. 부분 환불 금액 입력의 상한이다 */
  refundableAmount: number;
  /** 전자발표 정정. 발표 행이 없는 주문이면 null */
  invoiceAdjustment: AdminInvoiceAdjustment | null;
}

export interface PostAdminOrderPurchaseRequest {
  /** 공급처 발주번호. 공급처 API 가 없으면 관리자가 입력한다 */
  supplierOrderNo?: string;
  /** 24시간이 지나기 전(조기 발주)이면 필수. 사유가 주문에 기록된다 */
  earlyReason?: string;
}

export interface PostAdminOrderDeliveryStageRequest {
  /** 단계를 바꿀 주문 ID (1~100개). 하나라도 없거나 결제 완료가 아니면 전부 바뀌지 않는다 */
  orderIds: AdminOrderId[];
  /** 앞·뒤 어느 쪽으로든 바꿀 수 있다. 통관 상태와는 따로다 */
  deliveryStage: AdminOrderDeliveryStage;
  /** DELIVERED 일 때 실제 수령 시각 (ISO 8601). 생략하면 지금. 미래·다른 단계와 함께면 400 */
  deliveredAt?: string;
}

/** 보낸 필드만 고친다. 빈 문자열·null 이면 지운다 */
export interface PatchAdminOrderLocalDeliveryRequest {
  /** 대만 국내운송사 */
  localCarrier?: string | null;
  /** 대만 국내운송장 번호 */
  localTrackingNo?: string | null;
}

/**
 * @description 주문 및 발주 관리 목록. 결제 완료·입금 대기 주문만 내린다
 * Swagger: AdminOrderController_getAdminOrderList
 */
export const getAdminOrderList = (params?: GetAdminOrderListParams) =>
  fetcher.get<ApiResponse<GetAdminOrderListResponse>>("/admin/order", {
    params,
  });

/**
 * @description 주문 및 발주 관리 KPI 4개. 서로 겹칠 수 있어 합산하지 않는다
 * Swagger: AdminOrderController_getAdminOrderSummary
 */
export const getAdminOrderSummary = () =>
  fetcher.get<ApiResponse<GetAdminOrderSummaryResponse>>(
    "/admin/order/summary",
  );

/**
 * @description 주문 상세 (우측 드로어). 고객 주문 상세 + 발주·매입 + 24시간 타이머
 * Swagger: AdminOrderController_getAdminOrder
 */
export const getAdminOrderDetail = (orderId: AdminOrderId) =>
  fetcher.get<ApiResponse<GetAdminOrderDetailResponse>>(
    `/admin/order/${orderId}`,
  );

/**
 * @description 한국 발주 시작. 24시간 경과(timerState=READY) 전이면 earlyReason 이 있어야 하고
 * 조기 발주로 기록된다. 이미 발주했거나 취소가 접수됐으면 409. 공급처에 자동 주문이 나가지는
 * 않는다. 성공하면 배송 단계가 PREPARING_ORDER 로 바뀐다
 * Swagger: AdminOrderController_postAdminOrderPurchase
 */
export const createAdminOrderPurchase = (
  orderId: AdminOrderId,
  payload: PostAdminOrderPurchaseRequest,
) => fetcher.post(`/admin/order/${orderId}/purchase`, payload);

/**
 * @description 취소·계약해제 접수 철회. 고객이 취소 의사를 거둔 경우에만 쓴다.
 * 끝나지 않은 환불이 있으면 409 — 환불 요청을 먼저 취소하거나 환불을 끝낸다
 * Swagger: AdminOrderController_deleteAdminOrderCancelRequest
 */
export const deleteAdminOrderCancelRequest = (orderId: AdminOrderId) =>
  fetcher.delete(`/admin/order/${orderId}/cancel-request`);

/**
 * @description 배송 단계 변경 (여러 주문 한 번에). 하나라도 결제 완료가 아니면 전부 바뀌지 않는다(409).
 * 통관 상태와는 따로다
 * Swagger: AdminOrderController_postAdminOrderDeliveryStage
 */
export const updateAdminOrderDeliveryStage = (
  payload: PostAdminOrderDeliveryStageRequest,
) => fetcher.post("/admin/order/delivery-stage", payload);

/**
 * @description 대만 국내운송사·운송장 입력. 배송 단계는 바뀌지 않는다
 * Swagger: AdminOrderController_patchAdminOrderLocalDelivery
 */
export const updateAdminOrderLocalDelivery = (
  orderId: AdminOrderId,
  payload: PatchAdminOrderLocalDeliveryRequest,
) => fetcher.patch(`/admin/order/${orderId}/local-delivery`, payload);
