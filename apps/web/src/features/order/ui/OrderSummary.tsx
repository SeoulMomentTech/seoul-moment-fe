"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";

import { OrderAmountRows, type OrderAmountValues } from "./OrderAmountRows";

interface OrderSummaryProps extends OrderAmountValues {
  /** 배송지·전자발표가 제출 가능한지. 비면 `결제하기` 가 눌리지 않는다 */
  canSubmit: boolean;
  /** 주문 생성·결제 시작이 진행 중 — 버튼을 닫고 "처리 중…" 을 보인다 */
  isSubmitting: boolean;
  onSubmit(): void;
  className?: string;
}

/**
 * 데스크톱 결제 금액 패널. `결제하기` 는 배송지·전자발표가 제출 가능할 때만 눌린다.
 */
export function OrderSummary({
  canSubmit,
  isSubmitting,
  onSubmit,
  className,
  ...amounts
}: OrderSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("border border-black/20 p-6", className)}>
      <h2 className="text-body-2 mb-4 font-bold">{t("payment_amount")}</h2>

      <OrderAmountRows {...amounts} />

      <Button
        className="mt-5 h-12 w-full rounded-[4px]"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        type="button"
      >
        {t(isSubmitting ? "payment_processing" : "pay_now")}
      </Button>
    </div>
  );
}
