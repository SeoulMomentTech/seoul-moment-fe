"use client";

import { useRef } from "react";

import { MessageCircle, X } from "lucide-react";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Floating } from "@shared/ui/floating";

import { cn } from "@seoul-moment/ui";

import { useChatbotStore } from "../model/useChatbotStore";
import { useResetChatbotOnLanguageChange } from "../model/useResetChatbotOnLanguageChange";

// 전 페이지에 마운트되므로 초기 번들에는 버튼만 포함하고
// 패널 본체·대화 로직은 클릭 시점에 불러온다.
const ChatbotPanel = dynamic(() => import("./ChatbotPanel"), { ssr: false });

export default function ChatbotLauncher() {
  const t = useTranslations();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isOpen, toggle } = useChatbotStore();

  // 언어가 바뀌면 대화·추천 질문을 처음부터 다시 시작한다.
  useResetChatbotOnLanguageChange();

  return (
    <>
      <Floating
        className={cn(
          "bottom-6 right-6 z-40 max-sm:bottom-4 max-sm:right-4",
          // 모바일에서 패널이 전체화면이므로 버튼을 숨긴다. 닫기는 패널 헤더에서.
          isOpen && "max-sm:pointer-events-none max-sm:opacity-0",
        )}
      >
        <button
          aria-controls="chatbot-panel-title"
          aria-expanded={isOpen}
          aria-label={
            isOpen
              ? t("chatbot_launcher_close_label")
              : t("chatbot_launcher_open_label")
          }
          className="bg-brand duration-normal grid size-14 place-items-center rounded-full text-white shadow-[0_2px_6px_rgba(120,58,10,0.24),0_10px_24px_rgba(120,58,10,0.26)] transition-transform hover:-translate-y-0.5 active:translate-y-0 max-sm:size-12"
          onClick={toggle}
          ref={triggerRef}
          type="button"
        >
          {isOpen ? (
            <X aria-hidden="true" size={22} strokeWidth={2.5} />
          ) : (
            <MessageCircle aria-hidden="true" size={24} strokeWidth={2.25} />
          )}
        </button>
      </Floating>

      {isOpen && <ChatbotPanel triggerRef={triggerRef} />}
    </>
  );
}
