"use client";

import { useEffect } from "react";

import { ExternalLinkIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";

import { useUserOrderDetailQuery } from "@entities/order";
import { Button } from "@seoul-moment/ui";

import type { ExternalPayment } from "../model/useOrderSubmit";

/** LINE 쪽 화면이 주문 상태를 다시 묻는 간격 */
const ORDER_POLL_MS = 4000;

const FAILED_STATUSES = new Set(["FAILED", "CANCELED", "EXPIRED"]);

interface OrderPaymentWaitingProps {
  external: ExternalPayment;
  /** "다시 결제하기" — 결제 시작만 다시 부른다. 끝나면(409 포함) 주문을 즉시 다시 읽는다 */
  onRetry(): Promise<void> | void;
  isRetrying: boolean;
}

/**
 * 결제창을 외부 브라우저로 넘긴 뒤의 LINE 쪽 화면. 로그인된 쪽이라 주문 상세를 폴링하다가
 * 결제가 끝나면(완료·입금 대기) 결과 페이지로 간다. 이번 시도가 실패하면 문구만 바꾸고
 * 폼으로는 돌아가지 않는다 — 돌아가면 중복 주문을 부른다.
 */
export function OrderPaymentWaiting({
  external,
  onRetry,
  isRetrying,
}: OrderPaymentWaitingProps) {
  const t = useTranslations();
  const router = useRouter();

  const { data: order, refetch } = useUserOrderDetailQuery(external.orderId, {
    refetchInterval: ORDER_POLL_MS,
  });

  const isSettled =
    order?.status === "PAID" || order?.status === "PAYMENT_WAITING";

  useEffect(
    function goToResult() {
      if (isSettled)
        router.replace(`/payment/result?h=${external.resultToken}`);
    },
    [isSettled, router, external.resultToken],
  );

  // 이전 시도의 실패를 이번 시도의 실패로 읽지 않게 paymentId 를 맞춘다
  const isAttemptFailed =
    order?.payment?.paymentId === external.paymentId &&
    FAILED_STATUSES.has(order.payment.status);

  const handleRetry = async () => {
    await onRetry();
    void refetch();
  };

  return (
    <div className="grid justify-items-center gap-4 py-16 text-center max-sm:py-10">
      <ExternalLinkIcon
        aria-hidden
        className="size-10 text-black/30"
        strokeWidth={1.6}
      />
      <div className="grid gap-1">
        <p className="text-body-1 font-bold">
          {t(
            isAttemptFailed ? "payment_failed_title" : "payment_external_title",
          )}
        </p>
        <p className="text-body-4 text-neutral" role="status">
          {t(
            isAttemptFailed
              ? "payment_not_paid_retry_hint"
              : "payment_external_hint",
          )}
        </p>
      </div>
      <p className="text-body-4 text-neutral tabular-nums">
        <span className="mr-1.5">{t("payment_order_number")}</span>
        <span className="text-black">{external.orderNumber}</span>
      </p>
      <Button
        className="mt-2 h-11 rounded-[4px] px-6"
        disabled={isRetrying}
        onClick={() => void handleRetry()}
        type="button"
        variant="outline"
      >
        {t(isRetrying ? "payment_processing" : "payment_retry")}
      </Button>
    </div>
  );
}
