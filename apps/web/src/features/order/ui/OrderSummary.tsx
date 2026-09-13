"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";

import { OrderAmountRows, type OrderAmountValues } from "./OrderAmountRows";

interface OrderSummaryProps extends OrderAmountValues {
  className?: string;
}

/**
 * 데스크톱 결제 금액 패널.
 *
 * `결제하기` 는 비활성이다 — 장바구니 `주문하기`·상품상세 `구매하기` 와 같은 처리로,
 * 결제(LINE Pay·ECPay)가 붙을 때 UI 재작업이 없도록 마크업을 먼저 만들어 둔다.
 */
export function OrderSummary({ className, ...amounts }: OrderSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("border border-black/20 p-6", className)}>
      <h2 className="text-body-2 mb-4 font-bold">{t("payment_amount")}</h2>

      <OrderAmountRows {...amounts} />

      <Button
        aria-describedby="order-submit-hint"
        className="mt-5 h-12 w-full rounded-[4px]"
        disabled
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
