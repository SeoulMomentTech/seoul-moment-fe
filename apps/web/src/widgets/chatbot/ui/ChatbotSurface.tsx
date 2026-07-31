"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

import { MotionProvider } from "@shared/ui/motion-provider";

import {
  ChatComposer,
  ChatDisclaimer,
  ChatThread,
  useChatbotCopy,
  useChatStore,
} from "@features/chatbot";

import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotPanel } from "./ChatbotPanel";
import { ChatbotSheet } from "./ChatbotSheet";

interface ChatbotSurfaceProps {
  isDesktop: boolean;
  isOpen: boolean;
  launcherRef: RefObject<HTMLButtonElement | null>;
  panelId: string;
  onClose(): void;
}

const TITLE_ID = "chatbot-title";

/**
 * lazy 청크의 진입점. motion·Radix Sheet·스레드·컴포저·카드·mock 이 모두 이
 * 청크에 들어가고, 런처만 eager 로 남는다.
 *
 * MotionProvider 를 여기 두는 이유 — DESIGN.md §7 이 루트 레이아웃 배치를
 * 명시적으로 금지한다. 전역 위젯이면 더 심각해서(모든 라우트가 motion 번들을
 * 지불), 반드시 lazy 경계 **안쪽**이어야 한다.
 * reducedMotion="user" 가 패널 개폐를 커버한다: transform 계열은 타깃으로
 * 스냅하고 opacity 만 보간되어 크로스페이드가 된다.
 */
export function ChatbotSurface({
  isDesktop,
  isOpen,
  launcherRef,
  onClose,
  panelId,
}: ChatbotSurfaceProps) {
  const copy = useChatbotCopy();
  const hasMessages = useChatStore((state) => state.messages.length > 0);
  const reset = useChatStore((state) => state.reset);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  /*
   * 오픈 시 포커스는 hover/pointer 가 정밀한 기기에서만 컴포저로 보낸다.
   * 뷰포트 폭이 아니라 입력 방식으로 분기하는 게 맞다 — 터치에서 컴포저에
   * 포커스를 주면 키보드가 튀어나오고 시트가 눌리며 iOS 스크롤 점프가 난다.
   * 그 경우 포커스는 셸 컨테이너가 받아(각 셸이 처리) 스크린리더가 인사말부터
   * 읽게 한다.
   */
  useEffect(() => {
    if (!isOpen || !isDesktop) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!canHover.matches) return;

    composerRef.current?.focus({ preventScroll: true });
  }, [isDesktop, isOpen]);

  const handleReset = useCallback(() => {
    reset();
    composerRef.current?.focus({ preventScroll: true });
  }, [reset]);

  const body = (
    <>
      <ChatbotHeader
        canReset={hasMessages}
        onClose={onClose}
        onReset={handleReset}
        titleId={TITLE_ID}
      />
      <ChatThread />
      <ChatDisclaimer />
      {/* 데스크탑만 Enter 전송. 터치는 Return 이 개행이고 전송은 버튼 —
          Android IME 실패군 전체가 이 한 줄로 사라진다. */}
      <ChatComposer canSendOnEnter={isDesktop} textareaRef={composerRef} />
    </>
  );

  if (!isDesktop) {
    return (
      <MotionProvider>
        <ChatbotSheet
          isOpen={isOpen}
          onClose={onClose}
          title={copy("chatbot_panel_label")}
          titleId={TITLE_ID}
        >
          {body}
        </ChatbotSheet>
      </MotionProvider>
    );
  }

  return (
    <MotionProvider>
      <ChatbotPanel
        isOpen={isOpen}
        launcherRef={launcherRef}
        onClose={onClose}
        panelId={panelId}
        titleId={TITLE_ID}
      >
        {body}
      </ChatbotPanel>
    </MotionProvider>
  );
}
