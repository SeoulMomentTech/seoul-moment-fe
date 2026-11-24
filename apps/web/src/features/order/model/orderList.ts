import type {
  UserOrderListStatusFilter,
  UserOrderStatus,
} from "@shared/services/userOrder";

/** 주문 목록 상태 탭. 탭을 바꾸면 같은 API 를 status 만 바꿔 다시 부른다 */
export const ORDER_LIST_FILTERS: ReadonlyArray<{
  value: UserOrderListStatusFilter;
  labelKey: string;
}> = [
  { value: "ALL", labelKey: "order_filter_all" },
  { value: "IN_PROGRESS", labelKey: "order_filter_in_progress" },
  { value: "COMPLETED", labelKey: "order_filter_completed" },
  { value: "CANCELED", labelKey: "order_filter_canceled" },
];

/** 기간 필터. null 은 전체 기간(months 생략) */
export const ORDER_LIST_PERIODS: ReadonlyArray<number | null> = [
  1,
  3,
  6,
  12,
  null,
];

export const DEFAULT_ORDER_LIST_PERIOD = 3;

/**
 * 배송 6단계 진행바는 결제 완료 주문에만 그린다. 취소·환불 대상은 배지로만,
 * 입금 대기는 아직 배송이 시작되지 않았으므로 바를 그리지 않는다.
 */
export const showsDeliveryProgress = (status: UserOrderStatus) =>
  status === "PAID";

/** "외 N건" — 대표 상품 1건을 뺀 나머지 라인 수 */
export const getExtraItemCount = (itemCount: number) =>
  Math.max(0, itemCount - 1);
