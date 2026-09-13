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
          className={cn("tabular-nums", shippingFee == null && "text-neutral")}
        >
          {shippingFee == null
            ? t("shipping_fee_pending")
            : shippingFee > 0
              ? toNTCurrency(shippingFee)
              : t("free_shipping")}
        </span>
      </div>

      {regionLabel && (
        <p className="text-body-5 text-neutral py-0.5 pl-2.5">{regionLabel}</p>
      )}

      <hr className="my-4 border-0 border-t border-black/10" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body-3 font-semibold">
          {t("final_payment_amount")}
        </span>
        <span className="text-title-3 max-sm:text-title-4 font-bold tabular-nums tracking-[-0.03em]">
          {toNTCurrency(totalAmount)}
        </span>
      </div>
    </>
  );
}
