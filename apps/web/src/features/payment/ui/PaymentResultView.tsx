"use client";

import {
  CheckIcon,
  CircleAlert,
  Clock3Icon,
  CreditCardIcon,
  SearchXIcon,
} from "lucide-react";

import { useTranslations } from "next-intl";

import { toNTCurrency } from "@shared/lib/utils";
import type { GetPaymentResultRes } from "@shared/services/payment";
import {
  StatusCard,
  StatusInfo,
  StatusNotice,
  type StatusInfoRow,
} from "@shared/ui/status-card";

import { Link } from "@/i18n/navigation";

import { formatTaipeiDateTime, PaymentDepositInfo } from "@entities/payment";
import { Button } from "@seoul-moment/ui";

import type {
  PaymentFailureReason,
  PaymentResultState,
} from "../model/paymentResultState";

const METHOD_LABEL: Partial<
  Record<GetPaymentResultRes["payment"]["method"], string>
> = {
  ECPAY: "ECPay",
  LINE_PAY: "LINE Pay",
};

const methodLabel = (method: string) =>
  METHOD_LABEL[method as keyof typeof METHOD_LABEL] ?? method;

const REASON_KEY: Record<PaymentFailureReason, string> = {
  canceled: "payment_reason_canceled",
  expired: "payment_reason_expired",
  failed: "payment_reason_failed",
};

const ICON_CLASS = "size-7";

interface PaymentResultViewProps {
  state: PaymentResultState;
  /**
   * 로그인이 없는 브라우저 — LINE 에서 외부 브라우저로 넘어와 결제한 경우다. 이때만 "LINE 으로
   * 돌아가면 완료로 바뀌어 있다" 를 안내한다(PC 에서 결제한 사람에게는 소음이다).
   */
  isGuest?: boolean;
}

/** PG 에서 돌아온 브라우저가 처음 보는 화면. 로그인이 없을 수 있어 주문 정보는 토큰이 준 것만 */
export function PaymentResultView({
  state,
  isGuest = false,
}: PaymentResultViewProps) {
  const t = useTranslations();

  switch (state.kind) {
    case "loading":
    case "checking":
      return (
        <StatusCard
          actions={<ContinueShopping />}
          description={t("payment_checking_title")}
          icon={<CreditCardIcon aria-hidden className={ICON_CLASS} />}
          spinning
          title={t("payment_result_title")}
          tone="progress"
        >
          {state.kind === "checking" && state.delayed && (
            <StatusNotice>{t("payment_checking_delayed")}</StatusNotice>
          )}
        </StatusCard>
      );

    case "not-found":
      return (
        <StatusCard
          actions={<ContinueShopping />}
          description={t("payment_result_not_found_hint")}
          icon={<SearchXIcon aria-hidden className={ICON_CLASS} />}
          title={t("payment_result_not_found_title")}
          tone="muted"
        />
      );

    case "paid": {
      const { payment, orderNumber } = state.result;
      const rows: StatusInfoRow[] = [
        ...(payment.paidAt
          ? [
              {
                label: t("payment_paid_at"),
                value: formatTaipeiDateTime(payment.paidAt),
              },
            ]
          : []),
        {
          label: t("payment_method_label"),
          value: methodLabel(payment.method),
        },
        {
          label: t("payment_amount"),
          value: toNTCurrency(payment.amount),
          total: true,
        },
      ];

      return (
        <StatusCard
          actions={<ContinueShopping />}
          icon={
            <CheckIcon aria-hidden className={ICON_CLASS} strokeWidth={2.4} />
          }
          meta={<OrderNumber value={orderNumber} />}
          title={t("payment_paid_title")}
          tone="success"
        >
          <StatusInfo rows={rows} />
          {isGuest && (
            <StatusNotice>{t("payment_paid_line_hint")}</StatusNotice>
          )}
        </StatusCard>
      );
    }

    case "waiting":
      return (
        <StatusCard
          actions={<ContinueShopping />}
          icon={<Clock3Icon aria-hidden className={ICON_CLASS} />}
          meta={<OrderNumber value={state.result.orderNumber} />}
          title={t("payment_waiting_title")}
          tone="progress"
        >
          <PaymentDepositInfo payment={state.result.payment} />
        </StatusCard>
      );

    case "failed":
      return (
        <StatusCard
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/cart">{t("go_to_cart")}</Link>
              </Button>
              <Button asChild>
                <Link href="/">{t("payment_continue_shopping")}</Link>
              </Button>
            </>
          }
          icon={<CircleAlert aria-hidden className={ICON_CLASS} />}
          meta={<OrderNumber value={state.result.orderNumber} />}
          title={t("payment_failed_title")}
          tone="danger"
        >
          <StatusNotice tone="danger">
            <b className="text-danger font-semibold">
              {t(REASON_KEY[state.reason])}
            </b>
            {state.result.payment.failureCode && (
              <span className="text-body-5 ml-1.5 text-black/40">
                ({state.result.payment.failureCode})
              </span>
            )}
            <br />
            {t("payment_order_kept")}
          </StatusNotice>
        </StatusCard>
      );
  }
}

function OrderNumber({ value }: { value: string }) {
  return (
    <p className="text-body-4 font-mono tabular-nums text-black/50">{value}</p>
  );
}

function ContinueShopping() {
  const t = useTranslations();

  return (
    <Button asChild>
      <Link href="/">{t("payment_continue_shopping")}</Link>
    </Button>
  );
}
