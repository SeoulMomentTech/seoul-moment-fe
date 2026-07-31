"use client";

import { ArrowDown } from "lucide-react";

import { cn } from "@shared/lib/style";

import { ChatIntro } from "./ChatIntro";
import { ChatMessageItem } from "./ChatMessageItem";
import { useChatStore } from "../model/chatStore";
import { MAX_RENDERED_MESSAGES } from "../model/constants";
import { useChatbotCopy } from "../model/useChatbotCopy";
import { useChatController } from "../model/useChatController";
import { useThreadAutoScroll } from "../model/useThreadAutoScroll";

interface ChatThreadProps {
  className?: string;
}

export function ChatThread({ className }: ChatThreadProps) {
  const copy = useChatbotCopy();
  const messages = useChatStore((state) => state.messages);
  const pendingId = useChatStore((state) => state.pendingId);
  const { isSending, retry, sendQuickReply } = useChatController();

  // DOM 상한. role="log" 는 정의상 오래된 정보가 사라지는 것을 허용한다.
  const rendered = messages.slice(-MAX_RENDERED_MESSAGES);
  const lastId = rendered.at(-1)?.id;
  const isBusy = isSending || pendingId !== null;

  const { handleScroll, hasNewBelow, jumpToNewest, scrollRef } =
    useThreadAutoScroll({ deps: [rendered.length, lastId, isBusy] });

  // 마지막 어시스턴트 턴만 칩이 살아 있다. 안 그러면 낡은 칩이 낡은 의도를 쏜다.
  const lastAssistantId = [...rendered]
    .reverse()
    .find((message) => message.type !== "user_text")?.id;

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      {/*
        role="log" 을 쓴다. 암묵적으로 aria-live="polite" + aria-relevant="additions"
        이고 정의가 채팅 트랜스크립트와 정확히 일치한다.
        - 생 div + aria-live="polite" 는 더 나쁘다: 암묵 relevant 가
          "additions text" 라 스켈레톤→본문 교체까지 재낭독된다.
        - role="feed" 는 라이브 리전이 **아니어서** 추가 시 아무것도 알리지 않는다.
        - aria-atomic 을 절대 켜지 않는다. log 의 기본값 false 가 곧 "추가된
          노드만 낭독" 이고, true 면 답변마다 스레드 전체가 재낭독된다.
        - aria-busy 가 대기 상태의 정답 메커니즘 — true 인 동안 낭독을 보류하고
          false 로 뒤집힐 때 flush 하므로 부분 낭독이 없다.

        overscroll-contain: 스크롤 락이 없는 비모달 표면이라, 없으면 스크롤 끝에서
        휠 이벤트가 하위 페이지로 체이닝된다.
        [overflow-anchor:none]: WebKit 은 스크롤 앵커링이 없어 어차피 JS 로
        구현해야 하고, 그러면 브라우저 앵커링은 명시적 scrollTop 쓰기와 싸우기만
        한다. 한 메커니즘, 세 엔진, 동일 동작.
      */}
      <div
        aria-busy={isBusy}
        aria-label={copy("chatbot_thread_label")}
        className={cn(
          "scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain",
          // flex column + 자식의 mt-auto = 짧은 대화는 컴포저 쪽에 붙고,
          // 내용이 넘치면 mt-auto 가 0 으로 풀려 평범하게 스크롤된다.
          // 없으면 메시지가 상단에 몰려 아래로 큰 빈 공간이 남는다.
          "flex flex-col px-4 py-4 [overflow-anchor:none]",
        )}
        data-sentry-mask="true"
        onScroll={handleScroll}
        ref={scrollRef}
        role="log"
        tabIndex={-1}
      >
        {rendered.length === 0 ? (
          <ChatIntro
            className="mt-auto"
            disabled={isBusy}
            onSelect={sendQuickReply}
          />
        ) : (
          <ul className="mt-auto flex flex-col gap-4">
            {rendered.map((message, index) => {
              const previous = rendered[index - 1];
              const isSameSpeaker =
                previous !== undefined &&
                (previous.type === "user_text") ===
                  (message.type === "user_text");

              return (
                <ChatMessageItem
                  isBusy={isBusy}
                  isGroupStart={!isSameSpeaker}
                  isLatest={message.id === lastAssistantId}
                  key={message.id}
                  message={message}
                  onRetry={retry}
                  onSelectQuickReply={sendQuickReply}
                />
              );
            })}
          </ul>
        )}
      </div>

      {/*
        log 밖의 별도 상태 리전. role="status" 는 기본 polite + atomic 이라
        한 줄 상태에 맞다. 대기·새 메시지·오류 낭독을 모두 여기서 처리하고,
        role="alert"/assertive 는 쓰지 않는다(읽는 흐름을 끊는다).
      */}
      <div aria-live="polite" className="sr-only" role="status">
        {isBusy ? copy("chatbot_typing") : ""}
        {hasNewBelow ? copy("chatbot_new_message") : ""}
      </div>

      {/* 스크롤을 올려 읽는 중에 메시지가 도착했을 때만 나타난다. */}
      {hasNewBelow && (
        <button
          className={cn(
            "focus-ring text-body-5 absolute bottom-3 left-1/2 -translate-x-1/2",
            "flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-white",
            "shadow-[0_2px_10px_rgba(0,0,0,0.16)]",
          )}
          onClick={jumpToNewest}
          type="button"
        >
          <ArrowDown aria-hidden="true" className="size-3" />
          {copy("chatbot_jump_to_newest")}
        </button>
      )}
    </div>
  );
}
