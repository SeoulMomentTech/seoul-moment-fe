"use client";

import { useCallback } from "react";

import { useTranslations } from "next-intl";

import useLanguage from "@shared/lib/hooks/useLanguage";

import { CHATBOT_COPY, type ChatbotCopyKey } from "./copy";
import type { AssistantMessage } from "./types";

export type ChatbotCopy = (key: ChatbotCopyKey) => string;

/**
 * 시트에 키가 있으면 시트, 없으면 로컬 맵.
 *
 * next-intl(use-intl 4.4.0) 동작을 근거로 한다:
 * - `t.has(key)` 는 존재하고 onError 를 호출하지 않는다(silent) → 가드로 안전.
 * - 누락 키는 throw 하지 않고 `getMessageFallback` 기본값이 적용돼 **키 문자열
 *   그대로 렌더 + console.error** 가 된다. i18n/request.ts 에 onError /
 *   getMessageFallback 설정이 없어 이 기본값이 그대로 쓰인다. 즉 가드가
 *   없으면 사용자가 화면에서 `chatbot_greeting` 을 보게 된다.
 * - `resolvePath` 가 "." 로 split 하므로 flat map 에서 점 있는 키는 조용히
 *   실패한다 → 키는 반드시 flat snake_case.
 */
export const useChatbotCopy = (): ChatbotCopy => {
  const t = useTranslations();
  const locale = useLanguage();

  return useCallback(
    (key: ChatbotCopyKey) => (t.has(key) ? t(key) : CHATBOT_COPY[locale][key]),
    [t, locale],
  );
};

/**
 * 어시스턴트 메시지의 표시 텍스트. 서버 산문이 정형 카피를 이긴다.
 * 이 규칙이 한 곳에만 있어야 실 API 전환 시 렌더러를 손대지 않는다.
 */
export const resolveMessageText = (
  message: AssistantMessage,
  copy: ChatbotCopy,
): string => {
  if ("text" in message && message.text) return message.text;
  if ("textKey" in message && message.textKey) return copy(message.textKey);
  if (message.type === "assistant_error") return copy(message.reasonKey);

  return "";
};
