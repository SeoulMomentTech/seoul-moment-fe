import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

/** 상태 배지 옆에 붙는 "취소 신청됨". 크기는 옆 상태 배지에 맞춰 className 으로 받는다 */
export function OrderCancelRequestedBadge({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations();

  return (
    <span
      className={cn(
        "rounded-full border border-black/15 font-semibold text-black/60",
        className,
      )}
    >
      {t("order_cancel_requested_badge")}
    </span>
  );
}
