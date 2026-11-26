import type {
  AdminOrderChip,
  AdminOrderDeliveryStage,
  AdminOrderEventType,
  AdminOrderPaymentMethod,
  AdminOrderTimerState,
} from "@shared/services/order";
import type {
  AdminInvoiceAdjustStatus,
  AdminRefundStatus,
} from "@shared/services/refund";
import type { AdminShipmentCustomsStatus } from "@shared/services/shipment";

/** 목록 상태 칩. KPI 카드와 같은 기준으로 센다 */
export const ORDER_CHIPS: { value: AdminOrderChip; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "WAITING", label: "24시간 대기 중" },
  { value: "READY", label: "발주 가능" },
  { value: "CANCEL_REQUESTED", label: "취소 요청" },
  { value: "ORDERED", label: "발주 완료" },
];

export const ORDER_CHIP_LABEL = Object.fromEntries(
  ORDER_CHIPS.map((chip) => [chip.value, chip.label]),
) as Record<AdminOrderChip, string>;

/** 배송 6단계. 화면 문구는 서버 …Label 을 쓰고, 이 값은 필터 셀렉트에만 쓴다 */
export const DELIVERY_STAGES: {
  value: AdminOrderDeliveryStage;
  label: string;
}[] = [
  { value: "ORDER_CONFIRMED", label: "주문 확인" },
  { value: "PREPARING_ORDER", label: "상품 준비 중" },
  { value: "INTERNATIONAL_SHIPPING", label: "해외 배송 중" },
  { value: "ARRIVED_TAIWAN", label: "대만 도착" },
  { value: "LOCAL_DELIVERY", label: "대만 배송 중" },
  { value: "DELIVERED", label: "배송 완료" },
];

export const DELIVERY_STAGE_LABEL = Object.fromEntries(
  DELIVERY_STAGES.map((stage) => [stage.value, stage.label]),
) as Record<AdminOrderDeliveryStage, string>;

export const PAYMENT_METHOD_LABEL: Record<AdminOrderPaymentMethod, string> = {
  LINE_PAY: "LINE Pay",
  ECPAY: "ECPay",
};

/**
 * 행 색. 색만으로 상태를 읽게 하지 않으려고 표에는 timerStateLabel 을 함께 적는다.
 * WAITING 연한 파랑 · SOON 연한 주황 · READY 연한 초록 · CANCEL_REQUESTED 연한 분홍
 */
export const TIMER_ROW_CLASS: Record<AdminOrderTimerState, string> = {
  NOT_PAID: "",
  WAITING: "bg-blue-50/40",
  SOON: "bg-orange-50",
  READY: "bg-green-50",
  ORDERED: "",
  CANCEL_REQUESTED: "bg-pink-50",
};

export const TIMER_BADGE_CLASS: Record<AdminOrderTimerState, string> = {
  NOT_PAID: "bg-gray-100 text-gray-600",
  WAITING: "bg-blue-50 text-blue-700",
  SOON: "bg-orange-100 text-orange-700",
  READY: "bg-green-100 text-green-700",
  ORDERED: "bg-gray-100 text-gray-700",
  CANCEL_REQUESTED: "bg-pink-100 text-pink-700",
};

/** KPI 는 1분 간격으로 다시 부른다 */
export const ORDER_SUMMARY_REFETCH_MS = 60_000;

/** 공급처 발주번호·조기 발주 사유 최대 길이 (서버 검증과 같다) */
export const SUPPLIER_ORDER_NO_MAX = 100;
export const EARLY_REASON_MAX = 500;

/** 환불 금액·사유, 수동 완료 근거, 대만 운송장 최대 길이 (서버 검증과 같다) */
export const REFUND_REASON_MAX = 500;
export const REFUND_REFERENCE_MAX = 100;
export const LOCAL_DELIVERY_FIELD_MAX = 100;

export const REFUND_STATUS_LABEL: Record<AdminRefundStatus, string> = {
  REQUESTED: "요청",
  PROCESSING: "결과 미확인",
  COMPLETED: "완료",
  FAILED: "실패",
};

export const REFUND_STATUS_BADGE_CLASS: Record<AdminRefundStatus, string> = {
  REQUESTED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export const INVOICE_ADJUST_STATUS_LABEL: Record<
  AdminInvoiceAdjustStatus,
  string
> = {
  NONE: "정정 없음",
  PENDING: "정정 대기",
  VOIDED: "作廢",
  ALLOWANCED: "折讓",
  FAILED: "정정 실패",
};

export const CUSTOMS_STATUS_LABEL: Record<AdminShipmentCustomsStatus, string> =
  {
    WAITING: "대기",
    IN_PROGRESS: "진행",
    HELD: "보류",
    CLEARED: "완료",
  };

/** 작업 이력 문구. message 는 변경 내용 그대로라 보조로만 붙인다 */
export const ORDER_EVENT_LABEL: Record<AdminOrderEventType, string> = {
  CANCEL_REQUESTED: "취소 접수",
  CANCEL_REQUEST_WITHDRAWN: "취소 접수 철회",
  PURCHASED: "한국 발주",
  DELIVERY_STAGE_CHANGED: "배송 단계 변경",
  LOCAL_DELIVERY_UPDATED: "대만 운송장 입력",
  SHIPMENT_UPDATED: "통관·물류 수정",
  REFUND_REQUESTED: "환불 요청",
  REFUND_COMPLETED: "환불 완료",
  REFUND_FAILED: "환불 실패",
  REFUND_CANCELED: "환불 요청 취소",
  INVOICE_ADJUSTED: "발표 정정",
  INVOICE_ADJUST_FAILED: "발표 정정 실패",
};
