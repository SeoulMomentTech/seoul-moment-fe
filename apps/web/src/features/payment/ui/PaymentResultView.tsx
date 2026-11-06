"use client";

import type { ReactNode } from "react";

import {
  CheckCircle2,
  CircleAlert,
  Clock3Icon,
  LoaderCircleIcon,
  SearchXIcon,
} from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { GetPaymentResultRes } from "@shared/services/payment";

import { Link } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

import { getBankName } from "../model/bankName";
import type {
  PaymentFailureReason,
  PaymentResultState,
} from "../model/paymentResultState";
import { formatTaipeiDateTime } from "../model/taipeiTime";

const METHOD_LABEL: Record<GetPaymentResultRes["payment"]["method"], string> = {
  ECPAY: "ECPay",
  LINE_PAY: "LINE Pay",
};

const REASON_KEY: Record<PaymentFailureReason, string> = {
  canceled: "payment_reason_canceled",
  expired: "payment_reason_expired",
  failed: "payment_reason_failed",
};

interface PaymentResultViewProps {
  state: PaymentResultState;
}

/** PG 에서 돌아온 브라우저가 처음 보는 화면. 로그인이 없을 수 있어 주문 정보는 토큰이 준 것만 */
export function PaymentResultView({ state }: PaymentResultViewProps) {
  const t = useTranslations();

  switch (state.kind) {
    case "loading":
    case "checking":
      return (
        <Frame
          icon={
            <LoaderCircleIcon
              aria-hidden
              className="size-10 animate-spin text-black/40"
              strokeWidth={1.6}
            />
          }
          title={t("payment_checking_title")}
        >
          {state.kind === "checking" && state.delayed && (
            <p className="text-body-4 text-neutral" role="status">
              {t("payment_checking_delayed")}
            </p>
          )}
          <Actions />
        </Frame>
      );

    case "not-found":
      return (
        <Frame
          icon={
            <SearchXIcon
              aria-hidden
              className="size-10 text-black/30"
              strokeWidth={1.6}
            />
          }
          title={t("payment_result_not_found")}
        >
          <Actions />
        </Frame>
      );

    case "paid":
      return (
        <Frame
          icon={
            <CheckCircle2
              aria-hidden
              className="size-10 text-black"
              strokeWidth={1.6}
            />
          }
          title={t("payment_paid_title")}
        >
          <OrderNumber value={state.result.orderNumber} />
          <p className="text-body-3 tabular-nums">
            {`${METHOD_LABEL[state.result.payment.method]} · ${toNTCurrency(state.result.payment.amount)}`}
          </p>
          <p className="text-body-5 text-neutral">
            {t("payment_paid_line_hint")}
          </p>
          <Actions />
        </Frame>
      );

    case "waiting":
      return (
        <Frame
          icon={
            <Clock3Icon
              aria-hidden
              className="size-10 text-black"
              strokeWidth={1.6}
            />
          }
          title={t("payment_waiting_title")}
        >
          <OrderNumber value={state.result.orderNumber} />
          <DepositInfo payment={state.result.payment} />
          <Actions />
        </Frame>
      );

    case "failed":
      return (
        <Frame
          icon={
            <CircleAlert
              aria-hidden
              className="text-danger size-10"
              strokeWidth={1.6}
            />
          }
          title={t("payment_failed_title")}
        >
          <p className="text-body-4 text-neutral">
            {t(REASON_KEY[state.reason])}
            {state.result.payment.failureCode && (
              <span className="text-body-5 ml-1.5 text-black/40">
                ({state.result.payment.failureCode})
              </span>
            )}
          </p>
          <OrderNumber value={state.result.orderNumber} />
          <p className="text-body-4">{t("payment_order_kept")}</p>
          <Actions showCart />
        </Frame>
      );
  }
}

function Frame({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-4 py-16 text-center max-sm:py-10">
      {icon}
      <h2 className="text-body-1 font-bold">{title}</h2>
      {children}
    </div>
  );
}

function OrderNumber({ value }: { value: string }) {
  const t = useTranslations();

  return (
    <p className="text-body-4 text-neutral tabular-nums">
      <span className="mr-1.5">{t("payment_order_number")}</span>
      <span className="text-black">{value}</span>
    </p>
  );
}

/** ATM 은 은행·가상계좌, 편의점은 납부 코드. 둘 다 입금 기한을 대만 시각으로 */
function DepositInfo({ payment }: { payment: GetPaymentResultRes["payment"] }) {
  const t = useTranslations();
  const info = payment.depositInfo;
  if (!info) return null;

  const isAtm = info.paymentType.startsWith("ATM_");

  return (
    <div className="text-body-3 grid w-full max-w-sm gap-2 rounded-[4px] border border-black/10 p-4 text-left">
      {isAtm ? (
        <>
          <Row label="ATM 轉帳">{getBankName(info.bankCode ?? "")}</Row>
          <Row label={t("payment_virtual_account")}>
            <span className="text-body-2 font-bold tabular-nums tracking-wide">
              {info.account}
            </span>
          </Row>
        </>
      ) : (
        <Row label={t("payment_cvs_code_label")}>
          <span className="text-body-2 font-bold tabular-nums tracking-wide">
            {info.paymentNo}
          </span>
        </Row>
      )}
      <Row label={t("payment_amount")}>
        <span className="font-bold tabular-nums">
          {toNTCurrency(payment.amount)}
        </span>
      </Row>
      {payment.expireAt && (
        <p className="text-body-5 text-danger mt-1">
          {t("payment_deadline", {
            date: formatTaipeiDateTime(payment.expireAt),
          })}
        </p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-neutral shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Actions({ showCart = false }: { showCart?: boolean }) {
  const t = useTranslations();

  return (
    <div className={cn("mt-4 flex flex-wrap justify-center gap-2")}>
      {showCart && (
        <Button asChild className="h-11 rounded-[4px] px-6" variant="outline">
          <Link href="/cart">{t("go_to_cart")}</Link>
        </Button>
      )}
      <Button asChild className="h-11 rounded-[4px] px-6">
        <Link href="/">{t("payment_continue_shopping")}</Link>
      </Button>
    </div>
  );
}
