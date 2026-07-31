import { RotateCcw } from "lucide-react";

import { cn } from "@shared/lib/style";

import type { ChatMessageId, UserTextMessage } from "../model/types";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface UserBubbleProps {
  message: UserTextMessage;
  onRetry(messageId: ChatMessageId): void;
}

export function UserBubble({ message, onRetry }: UserBubbleProps) {
  const copy = useChatbotCopy();
  const isFailed = message.status === "failed";

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "text-body-3 max-w-[85%] px-3 py-2 leading-relaxed",
          // 오른쪽 아래만 각을 죽여 말꼬리를 만든다 — 꼬리 삼각형을 붙이지 않고
          // 방향을 주는 방법이고, 사이트의 하드한 형태 어휘와도 맞는다.
          "rounded-2xl rounded-br-md",
          isFailed ? "bg-danger/10 text-foreground" : "bg-black/5",
        )}
      >
        {message.text}
      </div>
      {isFailed && (
        <button
          className="focus-ring text-body-5 text-danger flex items-center gap-1 rounded px-1 py-0.5 hover:underline"
          onClick={() => onRetry(message.id)}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          {copy("chatbot_retry")}
        </button>
      )}
    </div>
  );
}
