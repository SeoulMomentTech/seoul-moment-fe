"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import { Link } from "@/i18n/navigation";

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
  /** 주문서로 갈 링크. 고른 라인이 없으면 `null` 이고 버튼은 비활성이다 */
  orderHref: string | null;
  className?: string;
}

/**
 * 결제 금액 요약.
 *
 * 배송비는 서버가 준 본섬 기준 예상값이고, 무료배송 여부는 **선택 합계**에 다시 적용한다 —
 * 서버 값은 장바구니 전체 기준이라 일부만 고르면 화면 금액과 어긋난다. 확정은 주문서에서 한다.
 *
 * `주문하기` 는 고른 라인을 주문서로 넘긴다. 비활성으로 남는 것은 주문서 마지막의
 * `결제하기` 뿐이다 — 결제(LINE Pay·ECPay)는 아직 붙지 않았다.
 */
export function CartSummary({
  selectedCount,
  amount,
  shippingFee,
  amountToFreeShipping,
  remoteIslandFee,
  totalAmount,
  orderHref,
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
        {/* 배송지가 아직 없어 본섬 기준으로 계산한 값이다. 금액 옆에서 바로 알 수 있어야
            사용자가 이 숫자를 확정 배송비로 읽지 않는다 — 확정은 주문서에서 한다. */}
        <span>{t("cart_shipping_fee_estimate")}</span>
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

      {orderHref ? (
        <Button asChild className="mt-5 h-12 w-full rounded-[4px] px-0">
          <Link
            className="flex h-full w-full items-center justify-center"
            href={orderHref}
          >
            {t("place_order")}
          </Link>
        </Button>
      ) : (
        <>
          <Button
            aria-describedby="cart-order-hint"
            className="mt-5 h-12 w-full rounded-[4px]"
            disabled
            type="button"
          >
            {t("place_order")}
          </Button>
          <p className="text-body-5 text-neutral mt-2" id="cart-order-hint">
            {t("select_items_to_order")}
          </p>
        </>
      )}

      <p className="text-body-5 text-neutral mt-3.5 leading-relaxed">
        {t("cart_shipping_estimate_note", {
          amount: toNTCurrency(remoteIslandFee),
        })}
      </p>
    </div>
  );
}
