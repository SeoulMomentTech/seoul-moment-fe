import type {
  GetUserOrderDetailRes,
  UserOrderRefundStatus,
} from "@shared/services/userOrder";

/** 사유는 서버 검증과 같다 */
export const CANCEL_REASON_MAX = 500;

/** 고객에게는 진행 중·완료·지연 셋으로만 보인다. 결과 미확인(PROCESSING)도 진행 중이다 */
export const REFUND_STATUS_KEY: Record<UserOrderRefundStatus, string> = {
  REQUESTED: "order_refund_in_progress",
  PROCESSING: "order_refund_in_progress",
  COMPLETED: "order_refund_completed",
  FAILED: "order_refund_delayed",
};

type CancelState = Pick<
  GetUserOrderDetailRes,
  "cancellationRequestedAt" | "refund" | "refundedAmount"
>;

/** 취소를 신청했거나 환불이 시작된 적이 있으면 취소·환불 영역을 보인다 */
export const showsCancelSection = ({
  cancellationRequestedAt,
  refund,
  refundedAmount,
}: CancelState): boolean =>
  Boolean(cancellationRequestedAt) || Boolean(refund) || refundedAmount > 0;

/** 결제 금액보다 적게 돌려준 환불 */
export const isPartialRefund = (
  order: Pick<GetUserOrderDetailRes, "refund" | "totalAmount">,
): boolean => !!order.refund && order.refund.amount < order.totalAmount;

/**
 * 영역 아래 안내 한 줄. 지연이면 고객센터 확인, 완료면 카드사 반영 시간,
 * 신청만 됐고 환불 전이면 확인 후 진행을 알린다. 진행 중이면 없다
 */
export type CancelNotice = "delayed" | "card" | "received" | null;

export const getCancelNotice = ({
  cancellationRequestedAt,
  refund,
}: CancelState): CancelNotice => {
  if (refund?.status === "FAILED") return "delayed";
  if (refund?.status === "COMPLETED") return "card";
  if (!refund && cancellationRequestedAt) return "received";
  return null;
};
