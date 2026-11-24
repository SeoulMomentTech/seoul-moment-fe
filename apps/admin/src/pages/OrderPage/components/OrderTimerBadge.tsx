import { AlertTriangle, Check, Clock } from "lucide-react";

import type { AdminOrderListItem } from "@shared/services/order";

import { cn } from "@seoul-moment/ui";

import { TIMER_BADGE_CLASS } from "../constants";
import { formatRemaining, getRemainingSeconds } from "../lib/remainingTime";

interface OrderTimerBadgeProps {
  timer: AdminOrderListItem;
  /** 응답을 받은 시각(ms). 서버의 남은 초를 여기서부터 깎는다 */
  receivedAt: number;
  now: number;
}

/**
 * 24시간 타이머. 대기 중이면 서버가 준 남은 초에서 카운트다운하고,
 * 그 밖의 상태는 서버 문구(timerStateLabel)를 그대로 쓴다.
 */
export function OrderTimerBadge({
  timer,
  receivedAt,
  now,
}: OrderTimerBadgeProps) {
  const isCounting =
    timer.timerState === "WAITING" || timer.timerState === "SOON";
  const remaining = isCounting
    ? formatRemaining(
        getRemainingSeconds(timer.remainingSeconds, receivedAt, now),
      )
    : null;

  const Icon =
    timer.timerState === "READY"
      ? Check
      : timer.timerState === "CANCEL_REQUESTED"
        ? AlertTriangle
        : timer.timerState === "SOON"
          ? Clock
          : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium tabular-nums",
        TIMER_BADGE_CLASS[timer.timerState],
      )}
      title={timer.timerStateLabel}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      {/* 카운트다운이 0 에 닿아도 상태는 서버가 바꾼다. 다음 응답 전까지는 서버 문구를 보인다 */}
      {remaining ?? timer.timerStateLabel}
    </span>
  );
}
