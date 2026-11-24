import type {
  AdminOrderChip,
  AdminOrderDeliveryStage,
  AdminOrderPaymentMethod,
  AdminOrderTimerState,
} from "@shared/services/order";

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
export const DELIVERY_STAGES: { value: AdminOrderDeliveryStage; label: string }[] =
  [
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
