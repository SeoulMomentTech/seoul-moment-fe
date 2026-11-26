import type { GetAdminOrderDetailResponse } from "@shared/services/order";
import type { AdminRefund } from "@shared/services/refund";

type RefundState = Pick<
  GetAdminOrderDetailResponse,
  "refund" | "refundableAmount" | "invoiceAdjustment" | "cancellation"
>;

/** 돈이 아직 다 나가지 않은 환불. 있으면 환불 버튼이 새 환불이 아니라 이 환불의 재시도다 */
export const isUnfinishedRefund = (refund: AdminRefund | null) =>
  refund !== null && refund.status !== "COMPLETED";

/** 환불 실행·재시도. 끝나지 않은 환불이 있거나 돌려줄 금액이 남았을 때 */
export const canRunRefund = ({ refund, refundableAmount }: RefundState) =>
  isUnfinishedRefund(refund) || refundableAmount > 0;

/**
 * 수동 환불 완료 입력. PG 밖에서 돌려준 환불(isManual)이거나, PG 가 거절했거나(FAILED)
 * 한 번도 보내지 못한(attemptCount 0) 환불만 된다. 결과 미확인(PROCESSING)은 재시도로
 * 결과부터 확인해야 이중 환불이 나지 않는다.
 */
export const canCompleteRefundManually = ({ refund }: RefundState) =>
  refund !== null &&
  isUnfinishedRefund(refund) &&
  refund.status !== "PROCESSING" &&
  (refund.isManual || refund.status === "FAILED" || refund.attemptCount === 0);

/** 환불 요청 취소. 아직 돈이 나가지 않은 REQUESTED · FAILED 만 */
export const canCancelRefund = ({ refund }: RefundState) =>
  refund?.status === "REQUESTED" || refund?.status === "FAILED";

/** 발표 정정 재시도. 환불이 끝났는데 정정이 실패·대기로 남은 경우 */
export const canRetryInvoiceAdjustment = ({ invoiceAdjustment }: RefundState) =>
  invoiceAdjustment?.adjustStatus === "FAILED" ||
  invoiceAdjustment?.adjustStatus === "PENDING";

/** 취소 접수 철회. 끝나지 않은 환불(자동 환불 포함)이 있으면 서버가 409 로 막는다 */
export const canWithdrawCancelRequest = ({
  cancellation,
  refund,
}: RefundState) =>
  cancellation.requestedAt !== null && !isUnfinishedRefund(refund);
