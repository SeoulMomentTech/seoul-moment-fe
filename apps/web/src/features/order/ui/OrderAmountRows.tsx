"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

export interface OrderAmountValues {
  productAmount: number;
  /** 확정 배송비. 배송지가 정해지기 전에는 `null` — 0(무료)과 구분해야 한다 */
  shippingFee: number | null;
  /** 배송비가 정해진 근거 표기 (예: `臺北市 信義區 · 본섬`). 미확정이면 `null` */
  regionLabel: string | null;
  /** 배송비가 미확정이면 상품 금액과 같다 */
  totalAmount: number;
  /**
   * 주소를 바꿔 금액을 다시 묻는 중. 지금 보이는 배송비·합계는 직전 주소 기준이라
   * 확정된 값처럼 읽히면 안 된다.
   */
  isRecalculating?: boolean;
}

/**
 * 금액 행들. 데스크톱 sticky 패널과 모바일 본문 섹션이 같은 표를 쓴다.
 *
 * 배송비는 `null`(미확정)·`0`(무료)·양수를 모두 다르게 쓴다 — 미확정을 0 으로 그리면
 * 주소를 넣기 전인데 무료배송처럼 읽힌다.
 */
export function OrderAmountRows({
  productAmount,
  shippingFee,
  regionLabel,
  totalAmount,
  isRecalculating = false,
}: OrderAmountValues) {
  const t = useTranslations();

  return (
    <>
      <div className="text-body-3 flex justify-between gap-4 py-1.5">
        <span>{t("total_product_amount")}</span>
        <span className="tabular-nums">{toNTCurrency(productAmount)}</span>
      </div>

      <div className="text-body-3 flex justify-between gap-4 py-1.5">
        <span>{t("shipping_fee")}</span>
        <span
          aria-busy={isRecalculating}
          className={cn(
            "tabular-nums transition-opacity",
            shippingFee == null && "text-neutral",
            isRecalculating && "opacity-40",
          )}
        >
          {shippingFee == null
            ? t("shipping_fee_pending")
            : shippingFee > 0
              ? toNTCurrency(shippingFee)
              : t("free_shipping")}
        </span>
      </div>

      {regionLabel && (
        <p
          className={cn(
            "text-body-5 text-neutral py-0.5 pl-2.5 transition-opacity",
            isRecalculating && "opacity-40",
          )}
        >
          {regionLabel}
        </p>
      )}

      <hr className="my-4 border-0 border-t border-black/10" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body-3 font-semibold">
          {t("final_payment_amount")}
        </span>
        <span
          aria-busy={isRecalculating}
          className={cn(
            "text-title-3 max-sm:text-title-4 font-bold tabular-nums tracking-[-0.03em] transition-opacity",
            isRecalculating && "opacity-40",
          )}
        >
          {toNTCurrency(totalAmount)}
        </span>
      </div>
    </>
  );
}
