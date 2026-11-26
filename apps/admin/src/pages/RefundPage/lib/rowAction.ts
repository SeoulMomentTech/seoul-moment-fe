import type { AdminRefundListItem } from "@shared/services/refund";

/**
 * 행 버튼. 환불(PG) 상태와 발표 정정 상태를 같이 보고 하나를 고른다.
 * - REQUESTED + 수동 환불 → 직접 돌려준 뒤 완료 입력
 * - FAILED · PROCESSING → 환불 재시도
 * - COMPLETED + 정정 FAILED · PENDING → 발표 정정 재시도 (환불은 다시 하지 않는다)
 */
export type RefundRowAction = "complete" | "retry" | "invoiceAdjust";

export const getRefundRowAction = (
  refund: AdminRefundListItem,
): RefundRowAction | null => {
  if (refund.status === "REQUESTED" && refund.isManual) return "complete";
  if (refund.status === "FAILED" || refund.status === "PROCESSING") {
    return "retry";
  }

  const adjustStatus = refund.invoiceAdjustment?.adjustStatus;
  if (
    refund.status === "COMPLETED" &&
    (adjustStatus === "FAILED" || adjustStatus === "PENDING")
  ) {
    return "invoiceAdjust";
  }

  return null;
};

export const REFUND_ROW_ACTION_LABEL: Record<RefundRowAction, string> = {
  complete: "완료 입력",
  retry: "환불 재시도",
  invoiceAdjust: "발표 정정 재시도",
};
