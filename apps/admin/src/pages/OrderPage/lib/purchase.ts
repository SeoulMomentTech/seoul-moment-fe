import type { AdminOrderListItem } from "@shared/services/order";

/** 24시간이 지나기 전이면 조기 발주다. 사유가 있어야 서버가 받는다 */
export const isEarlyPurchase = (timer: AdminOrderListItem) =>
  timer.timerState === "WAITING" || timer.timerState === "SOON";

/** 정상 발주가 막혔어도 사유를 적으면 조기 발주할 수 있는 주문 */
export const canStartEarlyPurchase = (timer: AdminOrderListItem) =>
  isEarlyPurchase(timer) &&
  timer.purchaseStatus === "NOT_ORDERED" &&
  !timer.cancellationRequested;
