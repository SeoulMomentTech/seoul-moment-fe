import { RotateCcw, TriangleAlert } from "lucide-react";

import type { AssistantErrorMessage, ChatMessageId } from "../model/types";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface ChatErrorNoticeProps {
  isRetrying: boolean;
  message: AssistantErrorMessage;
  onRetry(messageId: ChatMessageId): void;
}

/**
 * 에러는 토스트가 아니라 대화 흐름 안에 인라인으로 둔다 — sonner 는
 * z-index 999999999 로 패널을 덮는다. role="alert" 도 쓰지 않는다(읽고 있는
 * 내용을 끊는다). 낭독은 ChatThread 의 role="status" 리전이 맡는다.
 *
 * 재시도 버튼에 aria-describedby 를 걸어, 버튼만 따로 읽어도 무엇을 다시
 * 시도하는지 알 수 있게 한다.
 */
export function ChatErrorNotice({
  isRetrying,
  message,
  onRetry,
}: ChatErrorNoticeProps) {
  const copy = useChatbotCopy();
  const reasonId = `chatbot-error-${message.id}`;

  return (
    <div className="border-danger/25 bg-danger/5 flex items-start gap-2 rounded-lg border px-3 py-2.5">
      <TriangleAlert
        aria-hidden="true"
        className="text-danger mt-0.5 size-4 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-body-4 text-foreground" id={reasonId}>
          {copy(message.reasonKey)}
        </p>
        <button
          aria-describedby={reasonId}
          className="focus-ring text-body-5 text-danger mt-1 flex items-center gap-1 rounded px-1 py-0.5 font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRetrying}
          onClick={() => onRetry(message.retryOf)}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          {copy("chatbot_retry")}
        </button>
      </div>
    </div>
  );
}
