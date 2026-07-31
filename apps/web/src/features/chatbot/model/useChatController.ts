"use client";

import { useCallback, useRef } from "react";

import useLanguage from "@shared/lib/hooks/useLanguage";

import { useChatStore } from "./chatStore";
import type { ChatIntent, ChatMessageId, QuickReply } from "./types";
import { useChatbotCopy } from "./useChatbotCopy";
import { useSendChatMessageMutation } from "../api/useSendChatMessageMutation";

interface ChatController {
  isSending: boolean;
  send(text: string): void;
  sendQuickReply(reply: QuickReply): void;
  retry(messageId: ChatMessageId): void;
}

const errorReasonKey = () =>
  typeof navigator !== "undefined" && navigator.onLine === false
    ? ("chatbot_error_network" as const)
    : ("chatbot_error_generic" as const);

export const useChatController = (): ChatController => {
  const languageCode = useLanguage();
  const copy = useChatbotCopy();
  const mutation = useSendChatMessageMutation();

  /*
   * 중복 전송 가드. IME 환경에서 전송은 "조합 확정 Enter + 전송 Enter" 리듬이라
   * 빠른 타이피스트가 같은 프레임에 두 번 보내는 일이 실제로 생긴다.
   * mutation.isPending 은 상태 갱신이 한 프레임 늦으므로 ref 로 막는다.
   */
  const inFlightRef = useRef(false);

  const dispatch = useCallback(
    (text: string, intent?: ChatIntent) => {
      const trimmed = text.trim();
      if (!trimmed || inFlightRef.current) return;

      inFlightRef.current = true;

      const store = useChatStore.getState();
      // history 는 사용자 턴을 붙이기 전 상태여야 한다 — 서버가 "직전까지의
      // 대화 + 이번 message" 를 받는 형태가 되도록.
      const history = store.messages;
      const userMessage = store.appendUserMessage(trimmed);

      store.beginPending();

      mutation.mutate(
        { history, intent, languageCode, message: trimmed },
        {
          onSuccess: ({ messages }) => {
            useChatStore.getState().resolvePending(messages);
            useChatStore.getState().markUserMessageSent(userMessage.id);
          },
          onError: () => {
            useChatStore
              .getState()
              .failPending(userMessage.id, errorReasonKey());
          },
          onSettled: () => {
            inFlightRef.current = false;
          },
        },
      );
    },
    [languageCode, mutation],
  );

  const send = useCallback((text: string) => dispatch(text), [dispatch]);

  const sendQuickReply = useCallback(
    (reply: QuickReply) => dispatch(copy(reply.labelKey), reply.intent),
    [copy, dispatch],
  );

  const retry = useCallback(
    (messageId: ChatMessageId) => {
      const store = useChatStore.getState();
      const target = store.messages.find(
        (message) => message.id === messageId && message.type === "user_text",
      );

      if (!target || target.type !== "user_text") return;

      // 실패한 턴과 그 뒤의 에러 안내를 걷어내고 같은 문장을 다시 보낸다.
      // 안 걷어내면 재시도마다 같은 질문이 스레드에 누적된다.
      const errorNotices = store.messages.filter(
        (message) =>
          message.type === "assistant_error" && message.retryOf === messageId,
      );

      store.removeMessage(messageId);
      errorNotices.forEach((notice) => store.removeMessage(notice.id));

      dispatch(target.text);
    },
    [dispatch],
  );

  return { isSending: mutation.isPending, retry, send, sendQuickReply };
};
