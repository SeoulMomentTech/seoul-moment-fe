import type { AiConsultAnswerTag } from "@shared/services/aiConsult";

export interface ChatbotMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  /**
   * 봇 메시지에만 존재한다. 렌더가 이 값에 따라 갈리므로(문의 링크·되묻기 칩)
   * 메시지 단위로 보관한다.
   */
  tag?: AiConsultAnswerTag;
  /** 되묻기 칩. 비어 있지 않으면 tag 와 무관하게 노출한다. */
  suggestions?: string[];
  /** 네트워크·서버 오류로 전송이 실패한 사용자 메시지 */
  failed?: boolean;
}

/** 문의 폼 링크를 노출할 tag. 서버가 링크를 주지 않으므로 프론트가 판단한다. */
export const CONTACT_LINK_TAGS: AiConsultAnswerTag[] = [
  "FALLBACK",
  "OFF_TOPIC",
  "UNAVAILABLE",
];

/** 정상 답변과 시각적으로 구분해야 하는 tag */
export const WARNING_TAGS: AiConsultAnswerTag[] = ["UNAVAILABLE"];
