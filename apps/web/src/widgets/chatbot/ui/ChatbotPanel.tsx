"use client";

import { useEffect, useRef } from "react";

import { WifiOff, X } from "lucide-react";

import { useTranslations } from "next-intl";

import { useBodyScrollLock, useMediaQuery } from "@shared/lib/hooks";

import { cn } from "@seoul-moment/ui";

import ChatComposer from "./ChatComposer";
import { type IntroSuggestionsState } from "./ChatIntroSuggestions";
import ChatMessageList from "./ChatMessageList";
import RateLimitBanner from "./RateLimitBanner";
import { useGetAiConsultSuggestionsQuery } from "../api/useGetAiConsultSuggestionsQuery";
import { useChatbotConversation } from "../model/useChatbotConversation";
import { useChatbotStore } from "../model/useChatbotStore";

const FOCUSABLE =
  'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

interface ChatbotPanelProps {
  /** 닫힐 때 포커스를 되돌릴 런처 버튼 */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function ChatbotPanel({ triggerRef }: ChatbotPanelProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const panelRef = useRef<HTMLDivElement>(null);

  const { isOpen, close } = useChatbotStore();
  const { messages, send, retry, isPending, isRateLimited } =
    useChatbotConversation();

  // 패널을 열 때만 조회한다. 위젯은 전 페이지에 마운트되므로 마운트 시점에
  // 조회하면 챗봇을 열지 않는 사용자에게도 요청이 나간다.
  const { data: suggestions, status: suggestionsStatus } =
    useGetAiConsultSuggestionsQuery({ enabled: isOpen });

  const suggestionsState: IntroSuggestionsState =
    suggestionsStatus === "success"
      ? { status: "success", suggestions: suggestions?.list ?? [] }
      : { status: suggestionsStatus };

  const isOffline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  useEffect(
    // 오픈 직후 입력창으로 포커스를 옮긴다. 진입 애니메이션이 끝나기 전에
    // focus 하면 브라우저가 스크롤을 튀게 만들어 한 프레임 뒤로 미룬다.
    function focusComposerOnOpen() {
      if (!isOpen) return;

      const timer = setTimeout(function focusComposer() {
        panelRef.current
          ?.querySelector<HTMLTextAreaElement>("textarea")
          ?.focus();
      }, 120);

      return () => clearTimeout(timer);
    },
    [isOpen],
  );

  // 모바일은 패널이 전체화면이므로 배경 스크롤을 잠근다. 데스크톱 팝오버는
  // 페이지를 읽으며 대화하는 것이 목적이라 잠그지 않는다.
  useBodyScrollLock(isOpen && isMobile);

  useEffect(
    // Esc 로 닫고 런처로 포커스를 되돌리며, 열려 있는 동안 포커스를 패널 안에 묶는다.
    function bindEscapeAndFocusTrap() {
      if (!isOpen) return;

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
          triggerRef.current?.focus();
          return;
        }

        if (event.key !== "Tab") return;

        const focusable = [
          ...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
        ].filter((element) => element.offsetParent !== null);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    },
    [close, isOpen, triggerRef],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* 모바일은 전체화면이므로 딤이 필요하다. 데스크톱 팝오버는 페이지를
          읽으며 대화하는 것이 목적이라 딤·스크롤 잠금을 쓰지 않는다. */}
      {isMobile && (
        <div
          aria-hidden="true"
          className="z-39 fixed inset-0 bg-black/40"
          onClick={close}
        />
      )}

      <div
        aria-labelledby="chatbot-panel-title"
        aria-modal={isMobile}
        className={cn(
          "fixed z-40 flex flex-col bg-white",
          "animate-in fade-in-0 duration-slow",
          isMobile
            ? "slide-in-from-bottom-2 inset-0"
            : "zoom-in-95 bottom-24 right-6 h-[min(560px,calc(100vh-140px))] w-[380px] rounded-2xl shadow-2xl",
        )}
        ref={panelRef}
        role="dialog"
      >
        <header className="border-neutral-subtle flex flex-none items-center gap-2.5 border-b py-3 pl-4 pr-3">
          <h2
            className="text-body-2 min-w-0 flex-1 font-bold"
            id="chatbot-panel-title"
          >
            {t("chatbot_panel_title")}
          </h2>
          <button
            aria-label={t("chatbot_launcher_close_label")}
            className="text-neutral duration-fast hover:bg-neutral-subtle/40 hover:text-foreground grid size-9 place-items-center rounded-lg transition-colors"
            onClick={() => {
              close();
              triggerRef.current?.focus();
            }}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <ChatMessageList
          isPending={isPending}
          messages={messages}
          onRetry={retry}
          onSelectSuggestion={send}
          suggestionsState={suggestionsState}
        />

        <RateLimitBanner />

        {isOffline && (
          <p className="border-neutral-subtle bg-neutral-subtle/20 text-body-4 text-danger flex flex-none items-center gap-2 border-t px-4 py-2.5">
            <WifiOff aria-hidden="true" size={15} />
            {t("chatbot_offline_notice")}
          </p>
        )}

        <ChatComposer disabled={isPending || isRateLimited} onSend={send} />
      </div>
    </>
  );
}
