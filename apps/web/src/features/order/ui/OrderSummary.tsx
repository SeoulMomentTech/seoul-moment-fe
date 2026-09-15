"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";

import { OrderAmountRows, type OrderAmountValues } from "./OrderAmountRows";

interface OrderSummaryProps extends OrderAmountValues {
  /** 배송지 필수 항목이 다 찼는지. 비면 `결제하기` 가 눌리지 않는다 */
  canSubmit: boolean;
  className?: string;
}

/**
 * 데스크톱 결제 금액 패널.
 *
 * `결제하기` 는 배송지가 다 차야 눌린다. 누른 뒤의 결제(LINE Pay·ECPay)는 아직 붙지
 * 않았으므로 안내 문구는 그대로 둔다 — 외부 결제창 URL 을 받는 API 가 아직 없다.
 */
export function OrderSummary({
  canSubmit,
  className,
  ...amounts
}: OrderSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("border border-black/20 p-6", className)}>
      <h2 className="text-body-2 mb-4 font-bold">{t("payment_amount")}</h2>

      <OrderAmountRows {...amounts} />

      <Button
        aria-describedby="order-submit-hint"
        className="mt-5 h-12 w-full rounded-[4px]"
        disabled={!canSubmit}
        type="button"
      >
        {t("pay_now")}
      </Button>
      <p className="text-body-5 text-neutral mt-2" id="order-submit-hint">
        {t("coming_soon")}
      </p>
    </div>
  );
}
