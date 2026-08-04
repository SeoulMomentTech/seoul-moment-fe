import { languageMap } from "@/i18n/const";

import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/** 답변 종류. 레이트리밋·장애 상황도 200 으로 내려오므로 이 값으로 UI 를 분기한다. */
export type AiConsultAnswerTag =
  | "FAQ_ANSWER"
  | "BRAND_LIST"
  | "CATEGORY_LIST"
  | "PRODUCT_CATEGORY_LIST"
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

export interface AiConsultBrand {
  /** 브랜드 ID */
  id: number;
  /** 브랜드 이름 */
  name: string;
  /** 브랜드 프로필 이미지 URL. 없으면 null */
  image: string | null;
}

export interface AiConsultCategory {
  /** 카테고리 ID */
  id: number;
  /** 카테고리 이름 */
  name: string;
  /** 카테고리 이미지 URL. 대분류는 항상 null, 소분류도 미등록이면 null */
  image: string | null;
}

export interface AskAiConsultRes {
  /** 고객에게 보여줄 답변. 서버 상수에서 꺼낸 문장이며 AI 가 생성하지 않는다 */
  answer: string;
  tag: AiConsultAnswerTag;
  /** 되물을 추천 질문. 그대로 message 로 다시 보내면 된다. 답변이 확실하면 빈 배열 */
  suggestions: string[];
  /** 입점 브랜드 목록. tag 가 BRAND_LIST 일 때만 채워지고 그 외에는 빈 배열 */
  brands: AiConsultBrand[];
  /** 카테고리 목록. CATEGORY_LIST 면 대분류, PRODUCT_CATEGORY_LIST 면 소분류. 그 외 빈 배열 */
  categories: AiConsultCategory[];
  /** 소분류 목록의 상위 대분류. tag 가 PRODUCT_CATEGORY_LIST 일 때만 채워진다 */
  parentCategory: AiConsultCategory | null;
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
