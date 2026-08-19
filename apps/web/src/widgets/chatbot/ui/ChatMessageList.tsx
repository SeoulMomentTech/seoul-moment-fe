"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@seoul-moment/ui";

import ChatIntroSuggestions, {
  type IntroSuggestionsState,
} from "./ChatIntroSuggestions";
import ChatMessage from "./ChatMessage";
import { CHAT_SCROLLBAR } from "./scrollbar";
import type { ChatbotMessage } from "../model/types";

interface ChatMessageListProps {
  messages: ChatbotMessage[];
  suggestionsState: IntroSuggestionsState;
  isPending: boolean;
  onRetry(message: ChatbotMessage): void;
  onSelectSuggestion(suggestion: string): void;
}

const BOTTOM_THRESHOLD = 24;

export default function ChatMessageList({
  messages,
  suggestionsState,
  isPending,
  onRetry,
  onSelectSuggestion,
}: ChatMessageListProps) {
  const t = useTranslations();
  const logRef = useRef<HTMLDivElement>(null);
  /**
   * 새 메시지가 붙기 **전에** 사용자가 바닥에 있었는지. 메시지 추가 후에 계산하면
   * scrollHeight 가 이미 커져 있어 "위를 보고 있다"고 오판한다.
   */
  const wasAtBottomRef = useRef(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const scrollToBottom = () => {
    const log = logRef.current;
    if (!log) return;

    log.scrollTop = log.scrollHeight;
    wasAtBottomRef.current = true;
    setHasNewMessage(false);
  };

  useEffect(
    // 바닥에 있었으면 새 메시지로 따라 내려가고, 과거 대화를 보는 중이었으면
    // 스크롤을 건드리지 않고 "새 메시지" 버튼만 띄운다.
    function followNewMessages() {
      const log = logRef.current;
      if (!log) return;

      if (wasAtBottomRef.current) {
        log.scrollTop = log.scrollHeight;
      } else {
        setHasNewMessage(true);
      }
    },
    [messages, isPending],
  );

  const isFirstVisit = messages.length === 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-atomic="false"
        aria-live="polite"
        // overscroll-contain: 리스트 끝에 닿았을 때 스크롤이 배경 페이지로
        // 전파되는 것(스크롤 체이닝)을 막는다.
        className={cn(
          "flex flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain p-4",
          CHAT_SCROLLBAR,
        )}
        onScroll={(event) => {
          const log = event.currentTarget;
          const isAtBottom =
            log.scrollHeight - log.scrollTop - log.clientHeight <=
            BOTTOM_THRESHOLD;

          wasAtBottomRef.current = isAtBottom;
          if (isAtBottom) setHasNewMessage(false);
        }}
        ref={logRef}
      >
        {/* 대화가 시작된 뒤에도 맨 위에 남긴다. 챗봇이 무엇을 할 수 있는지와
            개인정보·세션 안내는 대화 중에도 유효한 정보다. */}
        <div className="bg-neutral-subtle/30 self-start rounded-xl rounded-bl-sm px-3.5 py-2.5">
          <p className="text-body-3 text-foreground leading-relaxed">
            {t("chatbot_welcome_message")}
          </p>
          <p className="text-body-5 text-neutral mt-1.5">
            {t("chatbot_privacy_notice")} {t("chatbot_session_notice")}
          </p>
        </div>

        {messages.map((message) => (
          <ChatMessage
            disabled={isPending}
            key={message.id}
            message={message}
            onRetry={onRetry}
            onSelectSuggestion={onSelectSuggestion}
          />
        ))}

        {isFirstVisit && !isPending && (
          <ChatIntroSuggestions
            onSelect={onSelectSuggestion}
            state={suggestionsState}
          />
        )}

        {isPending && (
          <div
            aria-label={t("chatbot_thinking")}
            className="bg-neutral-subtle/30 flex w-fit items-center gap-1 self-start rounded-xl rounded-bl-sm px-3.5 py-3.5"
            role="status"
          >
            {[0, 150, 300].map((delay) => (
              <span
                className="bg-neutral size-1.5 animate-pulse rounded-full"
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {hasNewMessage && (
        <button
          className="bg-foreground text-body-5 absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1.5 font-bold text-white shadow-lg"
          onClick={scrollToBottom}
          type="button"
        >
          {t("chatbot_new_message_label")} ↓
        </button>
      )}
    </div>
  );
}
