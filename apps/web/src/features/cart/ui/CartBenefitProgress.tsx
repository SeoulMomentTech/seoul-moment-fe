"use client";

import { CheckIcon, GiftIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import { CartBenefitTiers, useTierBenefitText } from "./CartBenefitTiers";
import { type BenefitTier, getTierProgress } from "../lib/benefitTiers";
import { getFreeShippingProgress } from "../lib/freeShippingProgress";

interface CartBenefitProgressProps {
  /** 선택된 라인의 상품 금액 합 */
  amount: number;
  /** 무료배송 기준 금액. 구간이 없을 때 이 한 단계로 진행도를 그린다 */
  freeShippingThreshold: number;
  /**
   * 구매 금액 구간별 혜택. 있으면 무료배송 기준 대신 구간으로 진행도와 단계를 그린다.
   * 서버에 구간 API 가 아직 없어 지금은 개발 서버에서 mock 으로만 들어온다.
   */
  tiers?: ReadonlyArray<BenefitTier>;
  className?: string;
}

interface ProgressView {
  /** 지금 받는 혜택 문구. 없으면 null */
  applied: string | null;
  /** 다음 혜택까지 남은 금액 안내. 마지막 단계면 null */
  hint: string | null;
  from: number;
  to: number;
  ratio: number;
}

/**
 * 장바구니 혜택 진행 카드. 결제 금액 요약(CartSummary)과 같은 틀로 그린다.
 *
 * 구간(`tiers`)이 없으면 서버가 주는 무료배송 기준 한 단계로 그린다. 구간 할인은 결제
 * 금액에 아직 반영되지 않으므로, 구간 API 가 붙기 전에는 배포 빌드에 구간을 넣지 않는다.
 */
export function CartBenefitProgress({
  amount,
  freeShippingThreshold,
  tiers,
  className,
}: CartBenefitProgressProps) {
  const t = useTranslations();
  const benefitText = useTierBenefitText();

  const tierProgress = tiers ? getTierProgress(amount, tiers) : null;
  const shipping = tierProgress
    ? null
    : getFreeShippingProgress({ amount, threshold: freeShippingThreshold });

  let view: ProgressView | null = null;

  if (tierProgress) {
    const { current, next, from, to, ratio, remaining } = tierProgress;
    view = {
      applied: current
        ? t("tier_applied", { benefit: benefitText(current) })
        : null,
      hint: next
        ? t("tier_next_hint", {
            amount: toNTCurrency(remaining),
            benefit: benefitText(next),
          })
        : null,
      from,
      to,
      ratio,
    };
  } else if (shipping) {
    view = {
      applied: shipping.achieved ? t("free_shipping_achieved") : null,
      hint: shipping.achieved
        ? null
        : t("free_shipping_remaining", {
            amount: toNTCurrency(shipping.remaining),
          }),
      from: 0,
      to: freeShippingThreshold,
      ratio: shipping.ratio,
    };
  }

  if (!view) return null;

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
            {toNTCurrency(amount)}
          </p>
        </div>
      </div>

      {view.hint && (
        <p className="text-body-3 mt-4 tabular-nums">{view.hint}</p>
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

      {/* PC 는 가로 스텝이 진행 상황을 보여주므로 바를 숨긴다. 구간이 없으면 스텝도 없어
          바가 유일한 진행 표시라 그때는 남긴다. */}
      <div className={tierProgress ? "lg:hidden" : undefined}>
        <div
          aria-label={t("cart_benefit_progress")}
          aria-valuemax={view.to}
          aria-valuemin={view.from}
          aria-valuenow={Math.min(Math.max(amount, view.from), view.to)}
          className="mt-4 h-1 bg-black/10"
          role="progressbar"
        >
          <div
            className="bg-brand h-full transition-[width] duration-300"
            style={{ width: `${view.ratio * 100}%` }}
          />
        </div>
        <div className="text-body-5 text-neutral mt-2 flex justify-between tabular-nums">
          <span>{toNTCurrency(view.from)}</span>
          <span>{toNTCurrency(view.to)}</span>
        </div>
      </div>

      {tierProgress && (
        <CartBenefitTiers
          currentIndex={tierProgress.currentIndex}
          tiers={tierProgress.tiers}
        />
      )}
    </section>
  );
}
