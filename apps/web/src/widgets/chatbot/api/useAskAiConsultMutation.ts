import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import { askAiConsult, type AskAiConsultRes } from "@shared/services/aiConsult";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";

/**
 * AI 상담 질문 전송
 *
 * 주의: 레이트리밋·LLM 장애도 **200 으로 내려온다.** 따라서 `onError` 가 아니라
 * `onSuccess` 안에서 `data.data.tag` 를 보고 화면을 갈라야 한다.
 * `onError` 로 오는 것은 네트워크 오류·5xx·타임아웃뿐이다.
 *
 * 서버가 이전 대화를 기억하지 않으므로 이전 메시지를 함께 보내지 않는다.
 * 에러는 전역 토스트가 아니라 패널 내부에서 처리하므로 `toastOnError: false`.
 */
export function useAskAiConsultMutation() {
  const languageCode = useLanguage();

  return useAppMutation<CommonRes<AskAiConsultRes>, HTTPError, string>({
    mutationFn: (message: string) => askAiConsult({ message, languageCode }),
    toastOnError: false,
  });
}
