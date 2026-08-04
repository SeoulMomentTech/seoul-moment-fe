"use client";

import { useEffect, useState } from "react";

import { WifiOff } from "lucide-react";

import { useTranslations } from "next-intl";

/**
 * 오프라인 안내 배너. navigator.onLine 을 초기값으로 잡고 online/offline
 * 이벤트로 갱신하므로, 패널이 열린 채 연결이 끊기거나 복구돼도 즉시 반영된다.
 */
export default function OfflineBanner() {
  const t = useTranslations();
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine === false,
  );

  useEffect(function trackConnection() {
    const sync = () => setIsOffline(navigator.onLine === false);

    // 마운트와 초기 렌더 사이에 상태가 바뀌었을 수 있어 한 번 맞춘다.
    sync();

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <p
      aria-live="polite"
      className="border-neutral-subtle bg-neutral-subtle/20 text-body-4 text-danger flex flex-none items-center gap-2 border-t px-4 py-2.5"
      role="status"
    >
      <WifiOff aria-hidden="true" size={15} />
      {t("chatbot_offline_notice")}
    </p>
  );
}
