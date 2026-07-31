import type { LanguageType } from "@/i18n/const";

import { resolveMockReply } from "./chatbotMock";
import { MOCK_DELAY_MS } from "../model/constants";
import type { ChatIntent, ChatMessage } from "../model/types";

/*
 * ★ 교체 이음새.
 *
 * 이 파일의 **시그니처는 최종형**이고 본문만 mock 이다. 실 엔드포인트가 나오면:
 *   1. shared/services/chatbot.ts 에 postChatMessage 추가
 *   2. useSendChatMessageMutation 의 mutationFn 을 그쪽으로 교체
 *   3. chatbotMock.ts 와 이 파일 삭제
 * useChatController · chatStore · 모든 ui/ 는 무변경 — SendChatMessageRes 만 보므로.
 */

export interface SendChatMessageReq {
  message: string;
  /** 서버가 stateless 하게 유지될 수 있도록 이전 턴을 함께 보낸다. */
  history: ChatMessage[];
  /** 칩에서 발생한 턴의 의도 힌트. 자유 입력이면 undefined. */
  intent?: ChatIntent;
  languageCode: LanguageType;
}

export interface SendChatMessageRes {
  messages: ChatMessage[];
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

export const sendChatMessage = async (
  req: SendChatMessageReq,
): Promise<SendChatMessageRes> => {
  await delay(MOCK_DELAY_MS);

  return {
    messages: resolveMockReply({
      createId,
      intent: req.intent,
      message: req.message,
      now: () => Date.now(),
    }),
  };
};
