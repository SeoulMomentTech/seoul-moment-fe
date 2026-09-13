import type { PropsWithChildren } from "react";
import { useId } from "react";

import { cn } from "@shared/lib/style";

interface OrderSectionProps extends PropsWithChildren {
  title: string;
  /** 제목 오른쪽 보조 표기 (예: 주문 라인 수) */
  badge?: string;
  className?: string;
}

/**
 * 주문서 섹션 껍데기.
 *
 * 상단 보더가 장바구니의 `black/10` 이 아니라 검정 1px 이다 — 주문서는 확인하는 서류라
 * 섹션 경계가 목록 화면보다 분명해야 한다(시안 §02 판단).
 */
export function OrderSection({
  title,
  badge,
  children,
  className,
}: OrderSectionProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "border-t border-black pb-8 pt-5",
        "max-sm:pb-7",
        className,
      )}
    >
      <h2
        className={cn(
          "text-body-1 mb-4 font-bold tracking-[-0.02em]",
          "max-sm:text-body-2",
        )}
        id={titleId}
      >
        {title}
        {badge && (
          <span className="text-brand ml-1.5 font-bold tabular-nums">
            {badge}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}
