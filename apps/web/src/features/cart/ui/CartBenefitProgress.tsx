"use client";

import { CheckIcon, GiftIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { setComma, toNTCurrency } from "@shared/lib/utils";
import type { UserInternationalDiscount } from "@shared/services/userCart";

import {
  getDiscountProgress,
  type DiscountProgress,
} from "../lib/discountProgress";
import { getFreeShippingProgress } from "../lib/freeShippingProgress";

interface CartBenefitProgressProps {
  /** 선택된 라인의 상품 금액 합 */
  amount: number;
  /** 무료배송 기준 금액. 할인 구간이 꺼져 있을 때 이 한 단계로 진행도를 그린다 */
  freeShippingThreshold: number;
  /**
   * 국제배송비 지원 할인 구간(서버 값). 켜져 있으면 무료배송 대신 다음 할인 구간까지 잰다.
   * `amount` 는 서버가 구간을 잰 장바구니 전체 금액(구매 가능 라인 합)이다 — 선택과 무관하다.
   */
  discount?: UserInternationalDiscount & { amount: number };
  className?: string;
}

/** 안내 문구 안에서 남은 금액 자리를 표시해 두었다가 강조 요소로 바꿔 끼운다 */
const AMOUNT_MARK = "\u0000";

interface ProgressView {
  /** 카드 오른쪽 위 "현재 금액" */
  amount: number;
  /** 지금 받는 혜택 문구. 없으면 null */
  applied: string | null;
  /** 다음 혜택까지 남은 금액 안내. 남은 금액 자리는 AMOUNT_MARK 다. 마지막 단계면 null */
  hint: string | null;
  /** 안내 문구에서 강조할 남은 금액 */
  remaining: number;
  /** 진행 바 아래 "다음 혜택 …" 에 쓸 짧은 혜택. 다음 단계가 없으면 null */
  nextBenefit: string | null;
  from: number;
  to: number;
  ratio: number;
}

/**
 * 장바구니 혜택 진행 카드. 결제 금액 요약(CartSummary)과 같은 틀로 그린다.
 *
 * 국제배송비 지원 할인이 켜져 있으면 다음 할인 구간까지의 진행도를, 꺼져 있으면 무료배송
 * 기준까지의 진행도를 그린다. 서버가 구간 전체를 주지 않아 단계 표시 없이 바 하나로 보여준다.
 */
export function CartBenefitProgress({
  amount,
  freeShippingThreshold,
  discount,
  className,
}: CartBenefitProgressProps) {
  const t = useTranslations();

  const discountProgress = discount
    ? getDiscountProgress({ ...discount, freeShippingThreshold })
    : null;
  const shipping = discountProgress
    ? null
    : getFreeShippingProgress({ amount, threshold: freeShippingThreshold });

  // "NT$120 折扣及台灣本島免運" 처럼 두 혜택을 한 문장으로 잇는다. 어순이 언어마다 달라 통문구를 쓴다.
  const benefitText = (value: number, freeShipping: boolean) => {
    if (value > 0 && freeShipping) {
      return t("tier_discount_and_free_shipping", {
        amount: toNTCurrency(value),
      });
    }

    return value > 0
      ? t("tier_discount", { amount: toNTCurrency(value) })
      : t("tier_free_shipping");
  };

  let view: ProgressView | null = null;

  if (discount && discountProgress) {
    const { applied, appliedFreeShipping, next, to, ratio }: DiscountProgress =
      discountProgress;
    view = {
      amount: discount.amount,
      applied:
        applied > 0 || appliedFreeShipping
          ? t("tier_applied", {
              benefit: benefitText(applied, appliedFreeShipping),
            })
          : null,
      hint: next
        ? t("tier_next_hint", {
            amount: AMOUNT_MARK,
            benefit: benefitText(next.discount, next.freeShipping),
          })
        : null,
      remaining: next?.remaining ?? 0,
      nextBenefit: next ? toNTCurrency(next.discount) : null,
      from: 0,
      to,
      ratio,
    };
  } else if (shipping) {
    view = {
      amount,
      applied: shipping.achieved ? t("free_shipping_achieved") : null,
      hint: shipping.achieved
        ? null
        : t("free_shipping_remaining", { amount: AMOUNT_MARK }),
      remaining: shipping.remaining,
      nextBenefit: shipping.achieved ? null : t("tier_free_shipping"),
      from: 0,
      to: freeShippingThreshold,
      ratio: shipping.ratio,
    };
  }

  if (!view) return null;

  const [hintBefore, hintAfter] = view.hint?.split(AMOUNT_MARK) ?? [];

  return (
    <section
      aria-labelledby="cart-benefit-progress-title"
      className={cn("border border-black/20 p-5 max-sm:p-4", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          className="text-body-1 flex items-center gap-2 whitespace-nowrap font-bold"
          id="cart-benefit-progress-title"
        >
          <GiftIcon aria-hidden="true" className="size-5" strokeWidth={1.6} />
          {t("cart_benefit_progress")}
        </h2>
        <div className="text-right">
          <p className="text-body-5 text-neutral">{t("current_amount")}</p>
          <p className="text-body-1 font-bold tabular-nums tracking-[-0.02em]">
            {toNTCurrency(view.amount)}
          </p>
        </div>
      </div>

      {view.hint && (
        <p className="text-body-3 mt-4 tabular-nums">
          {hintBefore}
          <strong className="text-brand font-bold">
            {toNTCurrency(view.remaining)}
          </strong>
          {hintAfter}
        </p>
      )}
      {view.applied && (
        // 크기(text-body-*)와 색(text-brand)을 한 cn() 에 넣으면 twMerge 가 크기를 지운다
        <p
          className={`text-body-3 ${cn(
            "text-brand flex items-center gap-1.5 font-semibold tabular-nums",
            view.hint ? "mt-2" : "mt-4",
          )}`}
        >
          <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
          {view.applied}
        </p>
      )}

      <div>
        <div
          aria-label={t("cart_benefit_progress")}
          aria-valuemax={view.to}
          aria-valuemin={view.from}
          aria-valuenow={Math.min(Math.max(view.amount, view.from), view.to)}
          className="mt-4 h-1 bg-black/10"
          role="progressbar"
        >
          <div
            className="bg-brand h-full transition-[width] duration-300"
            style={{ width: `${view.ratio * 100}%` }}
          />
        </div>
        {view.nextBenefit && (
          <p className="text-body-5 text-neutral mt-2 tabular-nums">
            {setComma(view.amount)} / {setComma(view.to)} · {t("next_benefit")}{" "}
            {view.nextBenefit}
          </p>
        )}
      </div>
    </section>
  );
}
