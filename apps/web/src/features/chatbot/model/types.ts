import type { ProductItem } from "@shared/services/product";

import type { ChatbotCopyKey } from "./copy";

export type ChatMessageId = string;

/** 실제 NLU 엔드포인트가 턴을 분류할 축. mock 도 같은 축을 쓴다. */
export type ChatIntent =
  | "product_recommend"
  | "order_status"
  | "shipping_info"
  | "content_discover"
  | "unknown";

export interface QuickReply {
  id: string;
  /** 칩 라벨은 항상 정형 카피다. */
  labelKey: ChatbotCopyKey;
  /** 탭했을 때 전송될 의도. mock 라우팅을 결정적으로 만든다. */
  intent: ChatIntent;
}

/** 뉴스/매거진 참조. href 는 렌더러가 @/i18n/navigation 으로 만든다. */
export interface ChatContentRef {
  id: number;
  resource: "news" | "magazine";
  title: string;
  thumbnail: string;
  category?: string;
}

interface ChatMessageBase {
  id: ChatMessageId;
  /** epoch ms — persist 를 통과해도 직렬화가 깨지지 않는다(Date 객체 금지). */
  createdAt: number;
}

interface AssistantMessageBase extends ChatMessageBase {
  /**
   * 서버가 내려준 산문. 있으면 textKey 를 이긴다.
   * 실 엔드포인트가 붙으면 이쪽만 채워진다.
   */
  text?: string;
  /**
   * 정형 카피 키. 렌더 시점마다 다시 번역되므로, 저장된 한국어 스레드를
   * 로케일 전환 후 다시 열면 해당 언어로 보인다 — mock 이 리터럴 문자열을
   * 박아두면 불가능한 동작이다.
   */
  textKey?: ChatbotCopyKey;
  quickReplies?: QuickReply[];
}

export interface UserTextMessage extends ChatMessageBase {
  type: "user_text";
  text: string;
  /** "failed" 여야 버블 옆에 재시도 어포던스가 나온다. */
  status: "sent" | "failed";
}

export interface AssistantTextMessage extends AssistantMessageBase {
  type: "assistant_text";
}

export interface AssistantProductsMessage extends AssistantMessageBase {
  type: "assistant_products";
  products: ProductItem[];
}

export interface AssistantContentsMessage extends AssistantMessageBase {
  type: "assistant_contents";
  contents: ChatContentRef[];
}

export interface AssistantErrorMessage extends ChatMessageBase {
  type: "assistant_error";
  /** 카피 키만. 서버 원문 문자열을 그대로 노출하지 않는다. */
  reasonKey: "chatbot_error_generic" | "chatbot_error_network";
  /** 재시도 시 다시 보낼 사용자 턴. */
  retryOf: ChatMessageId;
}

export interface AssistantPendingMessage extends ChatMessageBase {
  type: "assistant_pending";
}

export type ChatMessage =
  | UserTextMessage
  | AssistantTextMessage
  | AssistantProductsMessage
  | AssistantContentsMessage
  | AssistantErrorMessage
  | AssistantPendingMessage;

export type AssistantMessage = Exclude<ChatMessage, UserTextMessage>;

export const isAssistantMessage = (
  message: ChatMessage,
): message is AssistantMessage => message.type !== "user_text";
