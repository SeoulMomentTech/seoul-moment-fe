import { cn } from "@shared/lib/style";

import type { QuickReply } from "../model/types";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface ChatQuickRepliesProps {
  className?: string;
  /** 최신 어시스턴트 턴이 아니거나 전송 중이면 비활성. */
  disabled: boolean;
  replies: QuickReply[];
  onSelect(reply: QuickReply): void;
}

export function ChatQuickReplies({
  className,
  disabled,
  onSelect,
  replies,
}: ChatQuickRepliesProps) {
  const copy = useChatbotCopy();

  if (replies.length === 0) return null;

  return (
    <div
      // aria-live="off" — role="log" 자손이라 그냥 두면 칩 라벨 전부가 답변
      // 낭독에 섞여 들어간다. 칩은 조작 대상이지 낭독 대상이 아니다.
      aria-label={copy("chatbot_suggested_replies")}
      aria-live="off"
      // min-w-0 없으면 flex 자식이 줄어들지 못해 패널 밖으로 넘친다.
      className={cn("flex min-w-0 flex-wrap gap-1.5", className)}
      role="group"
    >
      {replies.map((reply) => (
        <button
          className={cn(
            "focus-ring text-body-5 rounded-full border px-2.5 py-1.5",
            "duration-normal max-w-full text-left transition-colors",
            disabled
              ? "cursor-not-allowed border-black/10 text-black/45"
              : "text-foreground border-black/15 hover:border-black hover:bg-black hover:text-white",
          )}
          disabled={disabled}
          key={reply.id}
          onClick={() => onSelect(reply)}
          // 컴포저가 <form> 이므로 type 을 명시하지 않으면 제출된다.
          type="button"
        >
          {copy(reply.labelKey)}
        </button>
      ))}
    </div>
  );
}
