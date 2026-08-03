"use client";

import { ArrowUpRight, CircleAlert } from "lucide-react";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { cn } from "@seoul-moment/ui";

import ChatSuggestions from "./ChatSuggestions";
import {
  CONTACT_LINK_TAGS,
  WARNING_TAGS,
  type ChatbotMessage,
} from "../model/types";

interface ChatMessageProps {
  message: ChatbotMessage;
  disabled?: boolean;
  onRetry(message: ChatbotMessage): void;
  onSelectSuggestion(suggestion: string): void;
}

export default function ChatMessage({
  message,
  disabled,
  onRetry,
  onSelectSuggestion,
}: ChatMessageProps) {
  const t = useTranslations();
  const isUser = message.role === "user";
  const showContactLink =
    !!message.tag && CONTACT_LINK_TAGS.includes(message.tag);
  const isWarning = !!message.tag && WARNING_TAGS.includes(message.tag);

  return (
    <div
      className={cn(
        "flex max-w-[86%] flex-col gap-1.5",
        isUser ? "self-end" : "self-start",
      )}
    >
      <div
        className={cn(
          "text-body-3 whitespace-pre-wrap rounded-xl px-3.5 py-2.5 leading-relaxed",
          isUser
            ? "border-brand/30 bg-brand/8 text-foreground rounded-br-sm border"
            : "bg-neutral-subtle/30 text-foreground rounded-bl-sm",
          isWarning && "border-brand/40 bg-brand/8 border",
        )}
      >
        {message.text}

        {showContactLink && (
          <Link
            className="border-neutral-subtle text-body-3 text-brand mt-2 flex min-h-9 items-center gap-1 border-t pt-2 font-semibold underline underline-offset-4"
            href="/contact"
          >
            {t("chatbot_escalate_label")}
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        )}
      </div>

      {message.failed && (
        <p className="text-body-5 text-danger flex flex-wrap items-center gap-2">
          <CircleAlert aria-hidden="true" size={14} />
          {t("chatbot_error_message")}
          <button
            className="min-h-8 rounded-md border border-current px-2 font-bold"
            disabled={disabled}
            onClick={() => onRetry(message)}
            type="button"
          >
            {t("chatbot_retry_label")}
          </button>
        </p>
      )}

      {/* 되묻기 칩. tag 가 아니라 배열 유무로 판단한다(OFF_TOPIC 에도 칩이 온다). */}
      {!isUser && !!message.suggestions?.length && (
        <ChatSuggestions
          disabled={disabled}
          onSelect={onSelectSuggestion}
          suggestions={message.suggestions}
        />
      )}
    </div>
  );
}
