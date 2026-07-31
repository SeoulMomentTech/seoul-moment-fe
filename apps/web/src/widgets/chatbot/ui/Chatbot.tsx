"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { useChatbotCopy, useChatStore } from "@features/chatbot";

import { ChatLauncher } from "./ChatLauncher";
import { useChatbotSurface } from "../model/useChatbotSurface";

/**
 * Header.tsx:34 의 lazy 오버레이 선례를 따르되 Suspense 를 명시적으로 감싼다.
 * Header 는 경계 없이 lazy 컴포넌트를 렌더해, 클릭(discrete input)에서 발생한
 * suspend 가 App Router 세그먼트 경계까지 올라갈 수 있다.
 */
const ChatbotSurface = lazy(() =>
  import("./ChatbotSurface").then((module) => ({
    default: module.ChatbotSurface,
  })),
);

const PANEL_ID = "chatbot-panel";

/** Playwright 가 상시 고정 요소를 비활성화할 수 있는 킬 스위치. */
const E2E_DISABLE_KEY = "e2e-disable-chatbot";

export function Chatbot() {
  const copy = useChatbotCopy();
  const isOpen = useChatStore((state) => state.isOpen);
  const toggle = useChatStore((state) => state.toggle);
  const close = useChatStore((state) => state.close);

  const { isDesktop, prefetch, shouldMountSurface } = useChatbotSurface(isOpen);
  const launcherRef = useRef<HTMLButtonElement>(null);

  /*
   * 렌더 중 localStorage 를 읽으면 하이드레이션이 어긋나므로 effect 에서 읽는다.
   * Playwright 는 addInitScript 로 페이지 로드 전에 값을 심으므로, 이 effect 가
   * 마운트 직후 실행되어 테스트가 상호작용하기 전에 사라진다.
   */
  const [isSuppressed, setIsSuppressed] = useState(false);

  useEffect(() => {
    try {
      setIsSuppressed(window.localStorage.getItem(E2E_DISABLE_KEY) === "1");
    } catch {
      // 프라이빗 모드 등에서 접근이 막히면 그냥 표시한다.
    }
  }, []);

  if (isSuppressed) return null;

  return (
    <>
      <ChatLauncher
        isOpen={isOpen}
        label={copy("chatbot_launcher_label")}
        onPrefetch={prefetch}
        onToggle={toggle}
        panelId={PANEL_ID}
        ref={launcherRef}
        unreadLabel={copy("chatbot_new_message")}
      />
      {shouldMountSurface && (
        <Suspense fallback={null}>
          <ChatbotSurface
            isDesktop={isDesktop}
            isOpen={isOpen}
            launcherRef={launcherRef}
            onClose={close}
            panelId={PANEL_ID}
          />
        </Suspense>
      )}
    </>
  );
}
