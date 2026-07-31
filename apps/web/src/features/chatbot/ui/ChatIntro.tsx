import { cn } from "@shared/lib/style";

import { ChatMark } from "./ChatMark";
import { ChatQuickReplies } from "./ChatQuickReplies";
import { CHAT_INTRO_SUGGESTIONS } from "../model/constants";
import type { QuickReply } from "../model/types";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface ChatIntroProps {
  className?: string;
  disabled: boolean;
  onSelect(reply: QuickReply): void;
}

/**
 * 첫 화면. "안녕하세요 👋" 로 끝내지 않는다 — 복합 어시스턴트라 방문자가
 * 먼저 **의도를 고를 수 있어야** 한다. 빈 상태가 인터페이스를 가르치는 자리다.
 *
 * 인사말은 어시스턴트의 첫 발화처럼 보이게 라벨 + 본문 구조를 그대로 쓴다 —
 * 별도의 배너나 일러스트를 얹지 않는다.
 */
export function ChatIntro({ className, disabled, onSelect }: ChatIntroProps) {
  const copy = useChatbotCopy();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div aria-hidden="true" className="flex items-center gap-1.5">
        <ChatMark className="text-brand size-3.5" />
        <span className="text-body-5 font-medium text-black/60">
          {copy("chatbot_name")}
        </span>
      </div>
      <p className="text-body-3 text-foreground leading-relaxed">
        {copy("chatbot_greeting")}
      </p>
      <p className="text-body-4 text-black/60">
        {copy("chatbot_greeting_hint")}
      </p>
      <ChatQuickReplies
        className="mt-1"
        disabled={disabled}
        onSelect={onSelect}
        replies={CHAT_INTRO_SUGGESTIONS}
      />
    </div>
  );
}
