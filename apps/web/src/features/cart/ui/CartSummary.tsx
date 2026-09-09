"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import { Button } from "@seoul-moment/ui";

export interface CartSummaryValues {
  selectedCount: number;
  /** 선택된 라인의 상품 금액 합 */
  amount: number;
  /** 선택 합계에 적용한 예상 배송비. 0 이면 무료 구간이다 */
  shippingFee: number;
  /** 무료배송까지 남은 금액. 0 이면 이미 무료배송이다 */
  amountToFreeShipping: number;
  /** 외섬 배송비 (안내용) */
  remoteIslandFee: number;
  totalAmount: number;
}

interface CartSummaryProps extends CartSummaryValues {
  className?: string;
}

/**
 * 결제 금액 요약.
 *
 * 배송비는 서버가 준 본섬 기준 예상값이고, 무료배송 여부는 **선택 합계**에 다시 적용한다 —
 * 서버 값은 장바구니 전체 기준이라 일부만 고르면 화면 금액과 어긋난다. 확정은 주문서에서 한다.
 *
 * `주문하기` 는 비활성이다. 상품상세의 `구매하기` 와 같은 처리 — 마크업을 지금 만들어 두고
 * 결제가 붙을 때 UI 재작업이 없게 한다.
 */
export function CartSummary({
  selectedCount,
  amount,
  shippingFee,
  amountToFreeShipping,
  remoteIslandFee,
  totalAmount,
  className,
}: CartSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("border border-black/20 p-6", className)}>
      <p className="text-body-3 text-neutral tabular-nums">
        {t("cart_selected_count", { count: selectedCount })}
      </p>
      <p className="text-body-3 mt-3.5">{t("total_product_amount")}</p>
      <p className="text-title-2 mt-0.5 font-bold tabular-nums tracking-[-0.03em]">
        {toNTCurrency(amount)}
      </p>

      <div className="text-body-3 mt-4 flex justify-between gap-4">
        <span>{t("shipping_fee")}</span>
        <span className="tabular-nums">
          {shippingFee > 0 ? toNTCurrency(shippingFee) : t("free_shipping")}
        </span>
      </div>

      {amountToFreeShipping > 0 && (
        <p className="text-body-5 text-brand mt-1.5 tabular-nums">
          {t("free_shipping_remaining", {
            amount: toNTCurrency(amountToFreeShipping),
          })}
        </p>
      )}

      <hr className="my-5 border-0 border-t border-black/10" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body-3">{t("estimated_total_amount")}</span>
        <span className="text-title-4 font-bold tabular-nums tracking-[-0.02em]">
          {toNTCurrency(totalAmount)}
        </span>
      </div>

      <Button
        aria-describedby="cart-order-hint"
        className="mt-5 h-12 w-full rounded-[4px]"
        disabled
        type="button"
      >
        {t("place_order")}
      </Button>
      <p className="text-body-5 text-neutral mt-2" id="cart-order-hint">
        {t("coming_soon")}
      </p>

      <p className="text-body-5 text-neutral mt-3.5 leading-relaxed">
        {t("cart_shipping_estimate_note", {
          amount: toNTCurrency(remoteIslandFee),
        })}
      </p>
    </div>
  );
}
