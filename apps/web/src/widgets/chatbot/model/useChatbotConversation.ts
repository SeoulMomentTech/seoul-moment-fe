"use client";

import { useCallback } from "react";

import {
  AI_CONSULT_MESSAGE_MAX_LENGTH,
  AI_CONSULT_MESSAGE_MIN_LENGTH,
} from "@shared/services/aiConsult";

import type { ChatbotMessage } from "./types";
import { useChatbotStore } from "./useChatbotStore";
import { useAskAiConsultMutation } from "../api/useAskAiConsultMutation";

let messageSeq = 0;
const nextId = () => `chatbot-${++messageSeq}`;

/**
 * RATE_LIMITED 응답을 받았을 때 전송을 막아 둘 시간.
 *
 * 서버 응답 스키마에 대기 시간 필드가 없어 클라이언트가 정한 값이다. 서버가
 * 남은 시간을 내려주게 되면 그 값을 쓰는 쪽으로 바꾼다.
 */
const RATE_LIMIT_BLOCK_MS = 60_000;

export function useChatbotConversation() {
  const {
    messages,
    addMessage,
    markLastUserMessageFailed,
    rateLimitedUntil,
    startRateLimit,
  } = useChatbotStore();
  const { mutate, isPending } = useAskAiConsultMutation();
  const isRateLimited = rateLimitedUntil !== null;

  const isSendable = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      return (
        !isPending &&
        !isRateLimited &&
        trimmed.length >= AI_CONSULT_MESSAGE_MIN_LENGTH &&
        trimmed.length <= AI_CONSULT_MESSAGE_MAX_LENGTH
      );
    },
    [isPending, isRateLimited],
  );

  const send = useCallback(
    (text: string) => {
      const message = text.trim();

      if (!isSendable(message)) return;

      addMessage({ id: nextId(), role: "user", text: message });

      mutate(message, {
        // 레이트리밋·LLM 장애도 200 으로 내려온다. 따라서 성공 경로에서
        // tag 를 보고 화면을 가른다. onError 는 네트워크·5xx·타임아웃 전용이다.
        onSuccess: (res) => {
          const {
            answer,
            tag,
            suggestions,
            brands,
            categories,
            parentCategory,
          } = res.data;

          addMessage({
            id: nextId(),
            role: "bot",
            text: answer,
            tag,
            suggestions,
            brands,
            categories,
            parentCategory,
          });

          // 답변은 그대로 보여주되(서버가 안내 문구를 담아 준다) 전송만 잠시 막는다.
          if (tag === "RATE_LIMITED") startRateLimit(RATE_LIMIT_BLOCK_MS);
        },
        onError: () => {
          markLastUserMessageFailed();
        },
      });
    },
    [addMessage, isSendable, markLastUserMessageFailed, mutate, startRateLimit],
  );

  const retry = useCallback(
    (message: ChatbotMessage) => {
      useChatbotStore.getState().removeMessage(message.id);
      send(message.text);
    },
    [send],
  );

  return { messages, send, retry, isPending, isRateLimited };
}
