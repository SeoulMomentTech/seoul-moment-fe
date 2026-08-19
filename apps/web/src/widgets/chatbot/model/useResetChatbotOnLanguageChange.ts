"use client";

import { useEffect } from "react";

import { useLanguage } from "@shared/lib/hooks";

import { useQueryClient } from "@tanstack/react-query";

import { useChatbotStore } from "./useChatbotStore";
import { AI_CONSULT_QUERY_KEY } from "../api/queryKey";

/**
 * 언어를 바꾸면 챗봇을 처음 상태로 되돌린다.
 *
 * 서버는 `Accept-language` 에 따라 답변 언어를 바꾸므로, 초기화하지 않으면 한
 * 대화 안에 두 언어의 답변이 섞인다. 추천 질문도 이전 언어 문구가 남는다.
 *
 * 마지막 언어를 컴포넌트 `useRef` 가 아니라 스토어에 두는 이유: 언어 변경은
 * `[locale]` 세그먼트 변경이라 이 훅을 쓰는 런처가 리마운트되고, 그러면 ref 가
 * 새 언어로 초기화되어 "바뀌었다"를 영영 감지하지 못한다.
 *
 * 패널이 닫혀 있을 때 언어를 바꿀 수도 있으므로 전 페이지에 마운트되는
 * 런처에서 호출한다.
 */
export function useResetChatbotOnLanguageChange() {
  const languageCode = useLanguage();
  const queryClient = useQueryClient();
  const storedLanguageCode = useChatbotStore((state) => state.languageCode);
  const setLanguageCode = useChatbotStore((state) => state.setLanguageCode);
  const reset = useChatbotStore((state) => state.reset);

  useEffect(
    function resetWhenLanguageChanged() {
      // 최초 진입: 기준 언어만 기록하고 초기화하지 않는다.
      if (storedLanguageCode === null) {
        setLanguageCode(languageCode);
        return;
      }

      if (storedLanguageCode === languageCode) return;

      setLanguageCode(languageCode);
      reset();
      // 추천 질문은 언어별로 키가 다르지만, 이전 언어 캐시를 남기지 않고
      // 새 언어로 처음부터 조회하도록 초기화한다.
      queryClient.resetQueries({ queryKey: AI_CONSULT_QUERY_KEY });
    },
    [languageCode, queryClient, reset, setLanguageCode, storedLanguageCode],
  );
}
