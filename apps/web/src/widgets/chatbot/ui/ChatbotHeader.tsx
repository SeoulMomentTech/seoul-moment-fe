import { RotateCcw, X } from "lucide-react";

import { ChatMark, useChatbotCopy } from "@features/chatbot";

interface ChatbotHeaderProps {
  canReset: boolean;
  /** 패널/시트의 aria-labelledby 대상. */
  titleId: string;
  onClose(): void;
  onReset(): void;
}

const ACTION_CLASS =
  "focus-ring flex size-8 shrink-0 items-center justify-center rounded-full text-black/50 transition-colors duration-normal hover:bg-black/5 hover:text-black";

export function ChatbotHeader({
  canReset,
  onClose,
  onReset,
  titleId,
}: ChatbotHeaderProps) {
  const copy = useChatbotCopy();

  return (
    <div className="flex items-center gap-2 border-b border-black/10 px-4 py-3">
      <ChatMark className="text-brand size-5 shrink-0" />
      {/* min-w-0 + truncate — 3개 로케일에서 제목이 액션 버튼을 밀어내지 않도록. */}
      <div className="min-w-0 flex-1">
        <p className="text-body-3 truncate font-semibold" id={titleId}>
          {copy("chatbot_name")}
        </p>
        <p className="text-body-5 truncate text-black/60">
          {copy("chatbot_subtitle")}
        </p>
      </div>
      {/*
        닫기 버튼이 DOM 상 **첫 포커스 요소**여야 한다 — 비모달 패널에는 포커스
        트랩이 없지만, 어느 상태에서든 Tab 한 번으로 탈출할 수 있어야 하고,
        파괴적인 초기화 버튼이 첫 스톱이 되면 안 된다.
        시각적 순서(초기화 → 닫기)는 order 로 맞춘다.
      */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label={copy("chatbot_close")}
          className={`${ACTION_CLASS} order-2`}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        {canReset && (
          <button
            aria-label={copy("chatbot_reset_thread")}
            className={`${ACTION_CLASS} order-1`}
            onClick={onReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
