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
  /** 고른 라인 기준 예상 배송비(본섬). 0 이면 무료 구간이다 */
  shippingFee: number;
  /** 무료배송까지 남은 금액. 0 이면 이미 무료배송이다 */
  amountToFreeShipping: number;
  /** 국제배송비 지원 할인액. 0 이면 행을 그리지 않는다 */
  discount: number;
  /** 외섬 배송비 (안내용) */
  remoteIslandFee: number;
  /** 상품 금액 + 배송비 - 할인 */
  totalAmount: number;
  /** 고른 라인·수량이 바뀌어 서버가 다시 계산하는 중. 지금 금액은 직전 기준이다 */
  isRecalculating?: boolean;
}

interface CartSummaryProps extends CartSummaryValues {
  /** 주문서로 갈 링크. 고른 라인이 없으면 `null` 이고 버튼은 비활성이다 */
  orderHref: string | null;
  className?: string;
}

/**
 * 결제 금액 요약.
 *
 * 금액은 **고른 라인만** 서버(주문서 미리보기)가 계산한 값이다(`useCartPreview`). 배송지가
 * 없어 배송비는 본섬 기준 예상값이고, 확정은 주문서에서 한다.
 *
 * `주문하기` 는 고른 라인을 주문서로 넘긴다. 비활성으로 남는 것은 주문서 마지막의
 * `결제하기` 뿐이다 — 결제(LINE Pay·ECPay)는 아직 붙지 않았다.
 */
export function CartSummary({
  selectedCount,
  amount,
  shippingFee,
  discount,
  remoteIslandFee,
  totalAmount,
  isRecalculating = false,
  orderHref,
  className,
}: CartSummaryProps) {
  const t = useTranslations();

  return (
    <div className={cn("grid gap-4", className)}>
      <section
        aria-labelledby="cart-order-amount-title"
        className="border border-black/20 p-5 max-sm:p-4"
      >
        <h2
          className="text-body-1 flex items-baseline justify-between gap-2 font-bold"
          id="cart-order-amount-title"
        >
          {t("order_amount")}
          <span className="text-body-5 text-neutral font-normal tabular-nums">
            {t("cart_selected_count", { count: selectedCount })}
          </span>
        </h2>

        <dl
          aria-busy={isRecalculating}
          className={cn(
            "text-body-3 mt-5 grid gap-3 transition-opacity",
            isRecalculating && "opacity-40",
          )}
        >
          <div className="flex justify-between gap-4">
            <dt>{t("total_product_amount")}</dt>
            <dd className="tabular-nums">{toNTCurrency(amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            {/* 배송지가 아직 없어 본섬 기준으로 계산한 값이다. 금액 옆에서 바로 알 수 있어야
                사용자가 이 숫자를 확정 배송비로 읽지 않는다 — 확정은 주문서에서 한다. */}
            <dt>{t("cart_shipping_fee_estimate")}</dt>
            <dd
              className={cn(
                "tabular-nums",
                shippingFee === 0 && amount > 0 && "text-brand font-semibold",
              )}
            >
              {shippingFee > 0 ? toNTCurrency(shippingFee) : t("free_shipping")}
            </dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-4">
              <dt>{t("international_shipping_discount")}</dt>
              <dd className="text-brand font-semibold tabular-nums">
                -{toNTCurrency(discount)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-black/10 pt-5">
          <span className="text-body-2 font-bold">
            {t("estimated_total_amount")}
          </span>
          <span
            aria-busy={isRecalculating}
            className={cn(
              "text-title-4 font-bold tabular-nums tracking-[-0.02em] transition-opacity",
              isRecalculating && "opacity-40",
            )}
          >
            {toNTCurrency(totalAmount)}
          </span>
        </div>
      </section>

      {/* 모바일은 하단 고정 바(CartBar)가 같은 CTA 를 들고 있다 — 두 번 그리지 않는다 */}
      <div className="max-sm:hidden">
        {orderHref ? (
          <Button asChild className="h-12 w-full rounded-[4px] px-0">
            <Link
              className="flex w-full items-center justify-center"
              href={orderHref}
            >
              {t("place_order")}
            </Link>
          </Button>
        ) : (
          <>
            <Button
              aria-describedby="cart-order-hint"
              className="h-12 w-full rounded-[4px]"
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
      </div>

      <p className="text-body-5 text-neutral leading-relaxed">
        {t("cart_shipping_estimate_note", {
          amount: toNTCurrency(remoteIslandFee),
        })}
      </p>
    </div>
  );
}
