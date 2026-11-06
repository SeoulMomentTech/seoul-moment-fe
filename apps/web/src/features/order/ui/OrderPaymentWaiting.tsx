"use client";

import { useEffect } from "react";

import { CircleAlert, ExternalLinkIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { StatusCard, StatusNotice, StatusPill } from "@shared/ui/status-card";

import { useRouter } from "@/i18n/navigation";

import { useUserOrderDetailQuery } from "@entities/order";
import { Button } from "@seoul-moment/ui";

import type { ExternalPayment } from "../model/useOrderSubmit";

/** LINE 쪽 화면이 주문 상태를 다시 묻는 간격 */
const ORDER_POLL_MS = 4000;

const FAILED_STATUSES = new Set(["FAILED", "CANCELED", "EXPIRED"]);

const COPY: Record<ExternalPayment["mode"], { title: string; hint: string }> = {
  external: {
    title: "payment_external_title",
    hint: "payment_external_hint",
  },
  "new-tab": { title: "payment_new_tab_title", hint: "payment_new_tab_hint" },
};

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
    // 주문서 제목 아래 남은 첫 화면 안에서 카드를 세로 가운데에 둔다
    <div className="flex min-h-[60svh] items-center justify-center py-10 max-sm:py-6">
      <StatusCard
        actions={
          <Button
            disabled={isRetrying}
            onClick={() => void handleRetry()}
            type="button"
            variant="outline"
          >
            {t(isRetrying ? "payment_processing" : "payment_retry")}
          </Button>
        }
        description={t(
          isAttemptFailed
            ? "payment_not_paid_retry_hint"
            : COPY[external.mode].hint,
        )}
        icon={
          isAttemptFailed ? (
            <CircleAlert aria-hidden className="size-7" />
          ) : (
            <ExternalLinkIcon aria-hidden className="size-7" />
          )
        }
        meta={<StatusPill>{external.orderNumber}</StatusPill>}
        spinning={!isAttemptFailed}
        title={t(
          isAttemptFailed ? "payment_failed_title" : COPY[external.mode].title,
        )}
        tone={isAttemptFailed ? "danger" : "progress"}
      >
        <StatusNotice>{t("payment_retry_notice")}</StatusNotice>
      </StatusCard>
    </div>
  );
}
