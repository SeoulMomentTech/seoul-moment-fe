import type { GetPaymentResultRes } from "@shared/services/payment";

export type PaymentFailureReason = "canceled" | "expired" | "failed";

/** 결과 페이지가 그릴 상태. `payment.status` 가 기준이고 `orderStatus` 는 보조다 */
export type PaymentResultState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "checking"; delayed: boolean }
  | { kind: "paid"; result: GetPaymentResultRes }
  | { kind: "waiting"; result: GetPaymentResultRes }
  | {
      kind: "failed";
      result: GetPaymentResultRes;
      reason: PaymentFailureReason;
    };

interface PaymentResultQueryLike {
  data?: GetPaymentResultRes;
  isPending: boolean;
  isError: boolean;
}

/**
 * 쿼리 상태 → 화면 상태. 404(만료·잘못된 토큰)와 그 밖 실패를 구분하지 않는다 — 어느 쪽이든
 * 사용자가 할 수 있는 일은 같다(링크를 다시 열거나 주문 내역으로).
 */
export const toPaymentResultState = (
  query: PaymentResultQueryLike,
  delayed: boolean,
): PaymentResultState => {
  if (query.isError) return { kind: "not-found" };
  if (!query.data)
    return query.isPending ? { kind: "loading" } : { kind: "not-found" };

  const { payment } = query.data;

  switch (payment.status) {
    case "REQUESTED":
    case "READY":
      return { kind: "checking", delayed };
    case "PAID":
      return { kind: "paid", result: query.data };
    case "WAITING_DEPOSIT":
      return { kind: "waiting", result: query.data };
    case "CANCELED":
      return { kind: "failed", result: query.data, reason: "canceled" };
    case "EXPIRED":
      return { kind: "failed", result: query.data, reason: "expired" };
    case "FAILED":
      return { kind: "failed", result: query.data, reason: "failed" };
  }
};
