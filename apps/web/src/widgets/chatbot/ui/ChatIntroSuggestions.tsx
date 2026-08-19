"use client";

import { useTranslations } from "next-intl";

import ChatSuggestions from "./ChatSuggestions";

/** 쿼리 status 를 그대로 쓴다. success 만 목록을 싣는다. */
export type IntroSuggestionsState =
  | { status: "pending" | "error" }
  | { status: "success"; suggestions: string[] };

interface ChatIntroSuggestionsProps {
  state: IntroSuggestionsState;
  onSelect(suggestion: string): void;
}

/**
 * 최초 진입 추천 질문. 조회 실패해도 직접 입력은 동작해야 하므로 패널 렌더를
 * 막지 않고 인라인으로만 알린다. 노출 여부(첫 방문·응답 대기 아님)는 호출부가 정한다.
 */
export default function ChatIntroSuggestions({
  state,
  onSelect,
}: ChatIntroSuggestionsProps) {
  const t = useTranslations();

  switch (state.status) {
    case "pending":
      return (
        <div
          aria-label={t("chatbot_suggestions_loading")}
          className="flex flex-wrap gap-1.5"
          role="status"
        >
          {[148, 186, 132].map((width) => (
            <span
              className="bg-neutral-subtle/50 h-9 animate-pulse rounded-full"
              key={width}
              style={{ width }}
            />
          ))}
        </div>
      );

    case "error":
      return (
        <p className="text-body-5 text-neutral">
          {t("chatbot_suggestions_error")}
        </p>
      );

    case "success":
      return (
        <ChatSuggestions onSelect={onSelect} suggestions={state.suggestions} />
      );
  }
}
