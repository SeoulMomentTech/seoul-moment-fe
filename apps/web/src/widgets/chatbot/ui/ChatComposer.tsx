"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { SendHorizontal } from "lucide-react";

import { useTranslations } from "next-intl";

import {
  AI_CONSULT_MESSAGE_MAX_LENGTH,
  AI_CONSULT_MESSAGE_MIN_LENGTH,
} from "@shared/services/aiConsult";

import { cn } from "@seoul-moment/ui";

import { CHAT_SCROLLBAR } from "./scrollbar";

/** 300자는 짧은 편이라 다 채우고 막히지 않도록 미리 카운터를 보여준다. */
const COUNTER_VISIBLE_FROM = Math.floor(AI_CONSULT_MESSAGE_MAX_LENGTH * 0.8);
const MAX_TEXTAREA_HEIGHT = 118;

interface ChatComposerProps {
  disabled?: boolean;
  onSend(message: string): void;
}

export default function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const t = useTranslations();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedLength = value.trim().length;
  const isOverflow = value.length > AI_CONSULT_MESSAGE_MAX_LENGTH;
  const isTooShort =
    trimmedLength > 0 && trimmedLength < AI_CONSULT_MESSAGE_MIN_LENGTH;
  const canSend = !disabled && !isOverflow && !isTooShort && trimmedLength > 0;

  const submit = () => {
    if (!canSend) return;

    onSend(value);
    setValue("");

    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중 Enter 는 확정 키이므로 전송하지 않는다.
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;

    event.preventDefault();
    submit();
  };

  return (
    <div className="border-neutral-subtle flex-none border-t p-3">
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="chatbot-input">
          {t("chatbot_input_placeholder")}
        </label>
        <textarea
          aria-invalid={isOverflow}
          className={cn(
            // 5줄을 넘으면 textarea 안에서 스크롤되므로 여기도 체이닝을 막는다.
            "text-body-3 max-h-[118px] min-h-11 flex-1 resize-none overflow-y-auto overscroll-contain rounded-xl border px-3 py-2.5 leading-relaxed outline-none",
            CHAT_SCROLLBAR,
            "focus:ring-brand focus:border-transparent focus:ring-2",
            isOverflow ? "border-danger" : "border-neutral-subtle",
          )}
          id="chatbot-input"
          onChange={(event) => {
            setValue(event.target.value);

            const textarea = event.currentTarget;
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("chatbot_input_placeholder")}
          ref={textareaRef}
          rows={1}
          value={value}
        />
        <button
          aria-label={t("chatbot_send_label")}
          className="bg-brand duration-fast grid size-11 flex-none place-items-center rounded-xl text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canSend}
          onClick={submit}
          type="button"
        >
          <SendHorizontal aria-hidden="true" size={18} />
        </button>
      </div>

      {value.length >= COUNTER_VISIBLE_FROM && (
        <p
          className={cn(
            "text-body-5 mt-1.5 text-right",
            isOverflow ? "text-danger font-bold" : "text-neutral",
          )}
        >
          {value.length} / {AI_CONSULT_MESSAGE_MAX_LENGTH}
          {isOverflow && ` · ${t("chatbot_input_limit_notice")}`}
        </p>
      )}
    </div>
  );
}
