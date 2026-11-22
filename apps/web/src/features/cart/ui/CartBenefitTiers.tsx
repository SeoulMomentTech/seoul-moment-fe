"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import type { BenefitTier } from "../lib/benefitTiers";

type StepState = "done" | "current" | "upcoming";

const stepState = (index: number, currentIndex: number): StepState => {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";

  return "upcoming";
};

/** 구간 혜택을 한 줄 문구로 만든다 — "NT$120 할인 + 본섬 무료배송" */
export const useTierBenefitText = () => {
  const t = useTranslations();

  return (tier: BenefitTier) =>
    [
      tier.discount > 0 &&
        t("tier_discount", { amount: toNTCurrency(tier.discount) }),
      tier.freeShipping && t("tier_free_shipping"),
    ]
      .filter(Boolean)
      .join(" + ");
};

function StepDot({ state }: { state: StepState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-[1] flex size-[18px] shrink-0 items-center justify-center rounded-full border bg-white",
        state === "done" && "border-black bg-black text-white",
        state === "current" && "border-brand border-2",
        state === "upcoming" && "border-black/20",
      )}
    >
      {state === "done" && <CheckIcon className="size-3" strokeWidth={3} />}
      {state === "current" && (
        <span className="bg-brand size-1.5 rounded-full" />
      )}
    </span>
  );
}

interface CartBenefitTiersProps {
  tiers: ReadonlyArray<BenefitTier>;
  /** 지금 적용되는 구간 index. 첫 구간 전이면 -1 */
  currentIndex: number;
}

/**
 * 구간 단계 표시. 넓은 화면(lg)은 가로 스텝, 좁은 화면은 접히는 목록으로 그린다.
 * 같은 데이터를 두 모양으로 그릴 뿐이라 한 컴포넌트에 둔다.
 */
export function CartBenefitTiers({
  tiers,
  currentIndex,
}: CartBenefitTiersProps) {
  const t = useTranslations();
  const benefitText = useTierBenefitText();

  return (
    <>
      <ol
        aria-label={t("tier_view_all")}
        className="mt-6 grid gap-x-2 max-lg:hidden"
        style={{ gridTemplateColumns: `repeat(${tiers.length}, 1fr)` }}
      >
        {tiers.map((tier, index) => {
          const state = stepState(index, currentIndex);
          const isLast = index === tiers.length - 1;

          return (
            <li
              aria-current={state === "current" ? "step" : undefined}
              // 글자 크기는 li 에 둔다 — 아래 span 의 색 클래스와 한 cn() 에 넣으면 twMerge 가 크기를 지운다
              className="text-body-5 relative flex flex-col items-center gap-2 text-center"
              key={tier.threshold}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-1/2 top-[8px] h-0.5 w-full",
                    index < currentIndex ? "bg-black" : "bg-black/10",
                  )}
                />
              )}
              <StepDot state={state} />
              <span className="text-body-5 whitespace-nowrap font-semibold tabular-nums">
                {toNTCurrency(tier.threshold)}
              </span>
              {/* 칸이 좁아(사이드 열 ÷ 단계 수) 한 줄 문구는 글자 단위로 꺾인다.
                  할인과 무료배송을 줄로 나누고 무료배송은 짧은 문구를 쓴다. */}
              <span
                className={cn(
                  "grid whitespace-nowrap tabular-nums leading-snug",
                  state === "current" ? "text-brand" : "text-neutral",
                )}
              >
                {tier.discount > 0 && (
                  // 칸이 좁아 "折 NT$120" 은 옆 칸과 붙는다. 금액에 빼기 부호만 단다.
                  <span>-{toNTCurrency(tier.discount)}</span>
                )}
                {tier.freeShipping && (
                  <span>+{t("tier_free_shipping_short")}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <details className="group mt-5 border-t border-black/10 lg:hidden">
        <summary className="text-body-3 flex cursor-pointer list-none items-center justify-between pt-4 font-semibold [&::-webkit-details-marker]:hidden">
          {t("tier_view_all")}
          <ChevronDownIcon
            aria-hidden="true"
            className="size-5 transition-transform group-open:rotate-180"
          />
        </summary>
        <ol className="mt-4 grid gap-3">
          {tiers.map((tier, index) => {
            const state = stepState(index, currentIndex);

            return (
              <li
                aria-current={state === "current" ? "step" : undefined}
                className="text-body-4 flex items-center gap-3"
                key={tier.threshold}
              >
                <StepDot state={state} />
                <span className="w-18 shrink-0 font-semibold tabular-nums">
                  {toNTCurrency(tier.threshold)}
                </span>
                <span
                  className={cn(
                    "flex flex-wrap items-center gap-1.5 tabular-nums",
                    state === "current" ? "text-brand" : "text-neutral",
                  )}
                >
                  {state === "current" && (
                    <span className="border-brand text-body-5 border px-1">
                      {t("tier_current")}
                    </span>
                  )}
                  {benefitText(tier)}
                </span>
              </li>
            );
          })}
        </ol>
      </details>
    </>
  );
}
