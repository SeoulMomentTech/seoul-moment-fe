"use client";

import { useId } from "react";

interface ChatSuggestionsProps {
  suggestions: string[];
  disabled?: boolean;
  onSelect(suggestion: string): void;
}

/**
 * 추천 질문 칩.
 *
 * 두 곳에서 쓴다 — 최초 진입(suggestions API)과 응답 후 되묻기(응답의 suggestions).
 * 노출 기준은 tag 가 아니라 배열이 비어 있지 않은지다.
 */
export default function ChatSuggestions({
  suggestions,
  disabled,
  onSelect,
}: ChatSuggestionsProps) {
  const id = useId();

  if (!suggestions.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((suggestion) => (
        <button
          className="border-brand/40 text-body-4 text-brand duration-fast hover:bg-brand/5 min-h-9 rounded-full border px-3 font-semibold transition-colors disabled:opacity-50"
          disabled={disabled}
          key={`${id}-${suggestion}`}
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
