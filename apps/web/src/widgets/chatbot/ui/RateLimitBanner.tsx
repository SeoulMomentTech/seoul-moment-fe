"use client";

import { useEffect, useState } from "react";

import { Clock } from "lucide-react";

import { useTranslations } from "next-intl";

import { useChatbotStore } from "../model/useChatbotStore";

const remainingSeconds = (until: number) =>
  Math.max(0, Math.ceil((until - Date.now()) / 1000));

/**
 * 레이트리밋 배너. 남은 시간을 1초 단위로 줄이고 0이 되면 스스로 해제한다.
 *
 * 표시되는 초는 서버가 알려준 값이 아니라 클라이언트가 정한 차단 시간이다
 * (`useChatbotConversation` 의 `RATE_LIMIT_BLOCK_MS`).
 */
export default function RateLimitBanner() {
  const rateLimitedUntil = useChatbotStore((state) => state.rateLimitedUntil);
  const clearRateLimit = useChatbotStore((state) => state.clearRateLimit);
  const t = useTranslations();
  const [seconds, setSeconds] = useState(() =>
    rateLimitedUntil ? remainingSeconds(rateLimitedUntil) : 0,
  );

  useEffect(
    // 남은 시간을 1초 단위로 줄이고, 0이 되면 스스로 차단을 해제한다.
    function countDownUntilUnblocked() {
      if (rateLimitedUntil === null) return;

      setSeconds(remainingSeconds(rateLimitedUntil));

      const timer = setInterval(function tick() {
        const left = remainingSeconds(rateLimitedUntil);
        setSeconds(left);

        if (left === 0) clearRateLimit();
      }, 1000);

      return () => clearInterval(timer);
    },
    [clearRateLimit, rateLimitedUntil],
  );

  if (rateLimitedUntil === null) return null;

  return (
    <p
      aria-live="polite"
      className="border-neutral-subtle bg-neutral-subtle/20 text-body-4 text-danger flex flex-none items-center gap-2 border-t px-4 py-2.5"
      role="status"
    >
      <Clock aria-hidden="true" size={15} />
      {t("chatbot_rate_limit_notice", { seconds })}
    </p>
  );
}
