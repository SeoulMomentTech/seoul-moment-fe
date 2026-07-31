import type { QuickReply } from "./types";

export const CHAT_STORAGE_KEY = "chatbot-thread";

/**
 * sessionStorage 에 남기는 최대 메시지 수. 상품 카드가 이미지 URL 을 함께
 * 들고 있어 긴 스레드는 스토리지 쿼터에 닿는다.
 */
export const MAX_PERSISTED_MESSAGES = 40;

/** DOM 에 유지하는 최대 메시지 수. role="log" 는 오래된 정보 소멸을 허용한다. */
export const MAX_RENDERED_MESSAGES = 200;

export const MOCK_DELAY_MS = 700;

/** 컴포저 최대 길이. onChange 가 아니라 compositionend/paste/submit 에서만 적용. */
export const MAX_MESSAGE_LENGTH = 500;

/** 컴포저가 자동으로 늘어나는 최대 줄 수. 이후 내부 스크롤. */
export const COMPOSER_MAX_ROWS = 4;

/** 하단 고정 판정 임계값(px). 등식 비교는 소수 scrollTop 에서 깨진다. */
export const PINNED_THRESHOLD_PX = 56;

/** 첫 화면 의도 라우팅 칩. 복합 어시스턴트라 진입점을 명시적으로 준다. */
export const CHAT_INTRO_SUGGESTIONS: QuickReply[] = [
  {
    id: "intro-product",
    labelKey: "chatbot_suggestion_product",
    intent: "product_recommend",
  },
  {
    id: "intro-order",
    labelKey: "chatbot_suggestion_order",
    intent: "order_status",
  },
  {
    id: "intro-shipping",
    labelKey: "chatbot_suggestion_shipping",
    intent: "shipping_info",
  },
  {
    id: "intro-content",
    labelKey: "chatbot_suggestion_content",
    intent: "content_discover",
  },
];
