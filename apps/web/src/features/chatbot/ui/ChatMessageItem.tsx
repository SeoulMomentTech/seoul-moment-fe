import { AssistantText } from "./AssistantText";
import { ChatContentCards } from "./ChatContentCards";
import { ChatErrorNotice } from "./ChatErrorNotice";
import { ChatMark } from "./ChatMark";
import { ChatProductCards } from "./ChatProductCards";
import { ChatQuickReplies } from "./ChatQuickReplies";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { UserBubble } from "./UserBubble";
import type { ChatMessage, ChatMessageId, QuickReply } from "../model/types";
import { resolveMessageText, useChatbotCopy } from "../model/useChatbotCopy";

interface ChatMessageItemProps {
  isBusy: boolean;
  /** 화자가 바뀌는 지점에만 라벨을 그린다. */
  isGroupStart: boolean;
  /** 마지막 어시스턴트 턴만 칩이 살아 있다. */
  isLatest: boolean;
  message: ChatMessage;
  onRetry(messageId: ChatMessageId): void;
  onSelectQuickReply(reply: QuickReply): void;
}

export function ChatMessageItem({
  isBusy,
  isGroupStart,
  isLatest,
  message,
  onRetry,
  onSelectQuickReply,
}: ChatMessageItemProps) {
  const copy = useChatbotCopy();

  if (message.type === "user_text") {
    return (
      <li>
        {/*
          확정된 비주얼이 라벨을 화자 전환 시에만 그리므로, 추가된 노드만
          낭독하는 스크린리더는 그룹의 2번째 이후 메시지에서 화자를 잃는다.
          그래서 **모든** 메시지가 보이는 라벨과 독립적으로 자체 sr-only
          화자 텍스트를 갖는다. 시각적 그룹핑과 접근성 귀속은 별개 관심사다.
        */}
        <span className="sr-only">{copy("chatbot_from_you")}</span>
        <UserBubble message={message} onRetry={onRetry} />
      </li>
    );
  }

  const quickReplies =
    "quickReplies" in message ? (message.quickReplies ?? []) : [];

  return (
    <li className="flex flex-col gap-2">
      <span className="sr-only">{copy("chatbot_from_assistant")}</span>

      {isGroupStart && (
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <ChatMark className="text-brand size-3.5" />
          <span className="text-body-5 font-medium text-black/60">
            {copy("chatbot_name")}
          </span>
        </div>
      )}

      {message.type === "assistant_pending" ? (
        <ChatTypingIndicator />
      ) : message.type === "assistant_error" ? (
        <ChatErrorNotice
          isRetrying={isBusy}
          message={message}
          onRetry={onRetry}
        />
      ) : (
        <>
          <AssistantText text={resolveMessageText(message, copy)} />
          {message.type === "assistant_products" && (
            <ChatProductCards products={message.products} />
          )}
          {message.type === "assistant_contents" && (
            <ChatContentCards contents={message.contents} />
          )}
        </>
      )}

      {quickReplies.length > 0 && (
        <ChatQuickReplies
          disabled={!isLatest || isBusy}
          onSelect={onSelectQuickReply}
          replies={quickReplies}
        />
      )}
    </li>
  );
}
