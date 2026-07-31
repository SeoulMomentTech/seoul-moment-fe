"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { ArrowUp } from "lucide-react";

import { cn } from "@shared/lib/style";

import { COMPOSER_MAX_ROWS, MAX_MESSAGE_LENGTH } from "../model/constants";
import { useChatbotCopy } from "../model/useChatbotCopy";
import { useChatController } from "../model/useChatController";
import { useImeSafeEnter } from "../model/useImeSafeEnter";

interface ChatComposerProps {
  /** 데스크탑에서만 Enter 전송. 터치는 Return 이 개행이고 전송은 버튼. */
  canSendOnEnter: boolean;
  className?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

const LINE_HEIGHT_PX = 20;
const VERTICAL_PADDING_PX = 20;

export function ChatComposer({
  canSendOnEnter,
  className,
  textareaRef,
}: ChatComposerProps) {
  const copy = useChatbotCopy();
  const { isSending, send } = useChatController();
  const [value, setValue] = useState("");
  const innerRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    send(trimmed.slice(0, MAX_MESSAGE_LENGTH));
    setValue("");
  }, [send, value]);

  const { isComposingRef, onCompositionEnd, onCompositionStart, onKeyDown } =
    useImeSafeEnter({ enabled: canSendOnEnter, onSubmit: submit });

  /*
   * 길이 제한을 onChange 에서 클램프하지 않고 maxLength 속성도 쓰지 않는다.
   * 조합 중에 값을 자르면 한글 자모가 쪼개진다. 제한은 조합이 끝난 뒤와
   * 붙여넣기·제출 시점에만 적용하고, 카운터는 한 조합 클러스터만큼 늦게
   * 따라오도록 둔다 — 이게 올바른 트레이드오프다.
   */
  const clampIfNotComposing = useCallback(() => {
    if (isComposingRef.current) return;
    setValue((current) =>
      current.length > MAX_MESSAGE_LENGTH
        ? current.slice(0, MAX_MESSAGE_LENGTH)
        : current,
    );
  }, [isComposingRef]);

  const handleCompositionEnd = useCallback(() => {
    onCompositionEnd();
    // rAF 로 조합 플래그가 내려간 다음에 클램프한다.
    requestAnimationFrame(clampIfNotComposing);
  }, [clampIfNotComposing, onCompositionEnd]);

  // 1줄 → COMPOSER_MAX_ROWS 줄까지 자동 성장, 이후 내부 스크롤.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    el.style.height = "auto";
    const max = LINE_HEIGHT_PX * COMPOSER_MAX_ROWS + VERTICAL_PADDING_PX;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value]);

  const isEmpty = value.trim().length === 0;

  return (
    <form
      className={cn(
        "flex items-end gap-2 border-t border-black/10 px-4 py-3",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="chatbot-composer">
        {copy("chatbot_composer_label")}
      </label>
      <textarea
        aria-describedby={canSendOnEnter ? "chatbot-composer-hint" : undefined}
        autoCapitalize="sentences"
        autoCorrect="on"
        className={cn(
          "focus-ring text-body-3 min-h-10 flex-1 resize-none rounded-lg",
          "scrollbar-thin border border-black/10 bg-white px-3 py-2.5",
          "placeholder:text-black/60",
        )}
        data-sentry-block="true"
        enterKeyHint={canSendOnEnter ? "send" : "enter"}
        id="chatbot-composer"
        onBlur={clampIfNotComposing}
        onChange={(event) => setValue(event.target.value)}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={onCompositionStart}
        onKeyDown={onKeyDown}
        onPaste={() => requestAnimationFrame(clampIfNotComposing)}
        placeholder={copy("chatbot_composer_placeholder")}
        ref={(node) => {
          innerRef.current = node;
          if (typeof textareaRef === "function") textareaRef(node);
          else if (textareaRef) textareaRef.current = node;
        }}
        rows={1}
        value={value}
      />
      {canSendOnEnter && (
        <span className="sr-only" id="chatbot-composer-hint">
          {copy("chatbot_composer_hint")}
        </span>
      )}
      {/*
        대기 중에도 textarea 는 잠그지 않는다 — 잠그면 진행 중인 IME 조합이
        날아가고, 채팅 위젯에서 가장 불만이 많은 동작이다. 전송 버튼만 막는다.
      */}
      <button
        aria-label={copy("chatbot_composer_send")}
        className={cn(
          "focus-ring flex size-10 shrink-0 items-center justify-center",
          "duration-normal rounded-lg transition-colors",
          isEmpty || isSending
            ? "cursor-not-allowed bg-black/10 text-black/45"
            : "bg-black text-white hover:bg-neutral-800",
        )}
        disabled={isEmpty || isSending}
        type="submit"
      >
        <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.25} />
      </button>
    </form>
  );
}
