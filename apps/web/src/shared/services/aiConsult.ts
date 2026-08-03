import { languageMap } from "@/i18n/const";

import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/** 답변 종류. 레이트리밋·장애 상황도 200 으로 내려오므로 이 값으로 UI 를 분기한다. */
export type AiConsultAnswerTag =
  | "FAQ_ANSWER"
  | "CONFIRM_SUGGESTION"
  | "FALLBACK"
  | "OFF_TOPIC"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

/** 질문 길이 제한. 서버가 400 으로 거절하므로 전송 전에 막는다. */
export const AI_CONSULT_MESSAGE_MIN_LENGTH = 2;
export const AI_CONSULT_MESSAGE_MAX_LENGTH = 300;

export interface AskAiConsultReq extends PublicLanguageCode {
  /** 고객 질문. 이전 대화를 기억하지 않으므로 자기완결적으로 작성 (2~300자) */
  message: string;
}

export interface AskAiConsultRes {
  /** 고객에게 보여줄 답변. 서버 상수에서 꺼낸 문장이며 AI 가 생성하지 않는다 */
  answer: string;
  tag: AiConsultAnswerTag;
  /** 되물을 추천 질문. 그대로 message 로 다시 보내면 된다. 답변이 확실하면 빈 배열 */
  suggestions: string[];
}

/**
 * @description AI 상담 질문
 *
 * 사전 정의된 FAQ 지식에서 의미 기반으로 답변을 찾아 반환한다. 단발성 질문-답변이며
 * 이전 대화를 기억하지 않는다. 레이트리밋·LLM 장애도 200 으로 응답하므로
 * `tag` 로 분기해야 한다.
 *
 * POST 는 `beforeRequest` 훅의 languageCode → Accept-language 변환 대상이 아니므로
 * (훅이 GET 만 처리) 헤더를 직접 넣는다.
 */
export const askAiConsult = ({ message, languageCode }: AskAiConsultReq) =>
  api
    .post("ai-consult/ask", {
      json: { message },
      headers: {
        "Accept-language": languageMap[languageCode] ?? "ko",
      },
    })
    .json<CommonRes<AskAiConsultRes>>();

export interface GetAiConsultSuggestionsRes {
  total: number;
  /** 추천 질문 문구. 누르면 그대로 `askAiConsult` 의 message 로 보낸다 */
  list: string[];
}

/**
 * @description AI 상담 시작 질문 목록
 *
 * 챗 위젯을 처음 열었을 때 노출할 추천 질문 칩. LLM 을 호출하지 않는 정적 목록이라
 * 비용이 들지 않고 응답이 즉시 나간다.
 */
export const getAiConsultSuggestions = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("ai-consult/suggestions", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetAiConsultSuggestionsRes>>();
