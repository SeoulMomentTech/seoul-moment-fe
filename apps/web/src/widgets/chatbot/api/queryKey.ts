/**
 * AI 상담 쿼리 키.
 *
 * 언어 변경 시 이 접두사로 한 번에 초기화하므로(useResetChatbotOnLanguageChange)
 * 조회 훅과 초기화 쪽이 같은 값을 쓰도록 여기서 관리한다.
 */
export const AI_CONSULT_QUERY_KEY = ["ai-consult"] as const;

export const aiConsultSuggestionsQueryKey = (languageCode: string) =>
  [...AI_CONSULT_QUERY_KEY, "suggestions", languageCode] as const;
