"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

export const MIN_QUANTITY = 1;

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  /** 스크린리더가 어느 상품의 수량인지 알 수 있게 상품명을 넘긴다. */
  label?: string;
  onChange(next: number): void;
}

/**
 * 수량 스테퍼. 디자인(Figma) 기준 86x32 한 박스에 `-` / 수량 / `+` 가 들어간다.
 *
 * 아이콘이 12px 이라 보이는 크기만으로는 터치 타겟이 한참 부족하다. 아이콘은 디자인대로 12px 로 두고
 * `::after` 로 히트 영역만 44px 로 넓힌다 — 박스 바깥으로 넘치지만 두 버튼 중심이 54px 떨어져 있어
 * 서로 겹치지 않는다.
 */
export function QuantityStepper({
  value,
  min = MIN_QUANTITY,
  max,
  disabled = false,
  className,
  label,
  onChange,
}: QuantityStepperProps) {
  const t = useTranslations();
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max == null || value < max);

  const hitArea =
    "after:absolute after:left-1/2 after:top-1/2 after:h-[44px] after:w-[40px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

  return (
    <div
      aria-label={label ? `${t("quantity")} - ${label}` : t("quantity")}
      className={cn(
        "flex w-[86px] items-center gap-[8px] rounded-[4px] border border-black/20 bg-white p-[8px]",
        disabled && "opacity-50",
        className,
      )}
      role="group"
    >
      <button
        aria-label={t("decrease_quantity")}
        className={cn(
          "text-neutral relative flex cursor-pointer items-center p-[2px]",
          hitArea,
          !canDecrease && "cursor-not-allowed text-black/20",
        )}
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        <MinusIcon height={12} strokeWidth={2.2} width={12} />
      </button>

      <span
        aria-live="polite"
        className="text-body-5 min-w-0 flex-1 text-center font-semibold tabular-nums"
      >
        {value}
      </span>

      <button
        aria-label={t("increase_quantity")}
        className={cn(
          "text-neutral relative flex cursor-pointer items-center p-[2px]",
          hitArea,
          !canIncrease && "cursor-not-allowed text-black/20",
        )}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        <PlusIcon height={12} strokeWidth={2.2} width={12} />
      </button>
    </div>
  );
}
