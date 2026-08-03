import { useLanguage } from "@shared/lib/hooks";
import {
  getAiConsultSuggestions,
  type GetAiConsultSuggestionsRes,
} from "@shared/services/aiConsult";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

interface Args {
  /**
   * 패널이 열렸을 때만 true 로 넘긴다. 챗봇 위젯은 전 페이지에 마운트되므로
   * 마운트 시점에 조회하면 챗봇을 열지 않는 사용자에게도 요청이 나간다.
   */
  enabled?: boolean;
}

/**
 * AI 상담 시작 질문 목록 (추천 질문 칩)
 *
 * 조회 실패가 패널 사용을 막지 않아야 한다. 칩이 없어도 직접 입력은 동작해야 하므로
 * 호출부에서 `isError` 를 인라인 안내로만 처리하고 렌더를 중단하지 않는다.
 */
export function useGetAiConsultSuggestionsQuery({ enabled }: Args = {}) {
  const languageCode = useLanguage();

  return useAppQuery<
    Awaited<ReturnType<typeof getAiConsultSuggestions>>,
    Error,
    GetAiConsultSuggestionsRes
  >({
    queryKey: ["ai-consult", "suggestions", languageCode],
    queryFn: () => getAiConsultSuggestions({ languageCode }),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: enabled !== false,
  });
}
