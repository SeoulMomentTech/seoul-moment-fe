import type { LanguageType } from "@/i18n/const";

/*
 * 챗봇 카피의 로컬 소유본.
 *
 * 왜 JSON(src/i18n/messages/*.json) 이 아닌가 —
 * scripts/syncLocaleFromSheet.js 가 세 JSON 을 Google Sheets 로부터 통째로
 * 덮어쓰고, package.json 의 "dev" 가 매 실행마다 그 sync 를 먼저 돌린다.
 * 손으로 넣은 키는 `pnpm dev` 한 번에 사라진다. 게다가 그 스크립트는
 * GOOGLE_SERVICE_ACCOUNT_JSON 없이 throw 하므로, 시트 자격증명이 없는
 * 개발자는 아예 dev 서버를 띄울 수 없다.
 *
 * 그래서 카피를 여기서 소유하고, 시트에 같은 키가 들어오면 시트가 이긴다
 * (useChatbotCopy 의 t.has() 가드). 시트 행이 랜딩되면 이 파일을 삭제하고
 * useTranslations 를 직접 쓰면 된다 — 호출부는 그대로다.
 *
 * 제약: ICU 플레이스홀더를 쓰지 않는다. 폴백 경로가 평범한 맵 조회여야 하고
 * ICU 를 재구현하지 않기 위해서다. 동적 값은 JSX 에서 조합한다.
 */
const ko = {
  chatbot_launcher_label: "무엇이든 물어보세요",
  chatbot_launcher_open: "Seoul Moment 어시스턴트 열기",
  chatbot_launcher_close: "Seoul Moment 어시스턴트 닫기",
  chatbot_panel_label: "Seoul Moment 어시스턴트",
  chatbot_name: "Seoul Moment",
  chatbot_subtitle: "쇼핑 도우미",
  chatbot_thread_label: "대화 내용",
  chatbot_from_assistant: "Seoul Moment 답변",
  chatbot_from_you: "내 메시지",
  chatbot_greeting:
    "안녕하세요, Seoul Moment예요. 상품 추천부터 주문·배송 확인, 읽을거리 추천까지 도와드릴 수 있어요.",
  chatbot_greeting_hint: "아래에서 골라보거나 직접 입력해 주세요.",
  chatbot_suggestion_product: "상품 추천 받기",
  chatbot_suggestion_order: "주문·배송 조회",
  chatbot_suggestion_shipping: "해외 배송 안내",
  chatbot_suggestion_content: "요즘 볼만한 콘텐츠",
  chatbot_composer_label: "메시지 입력",
  chatbot_composer_placeholder: "메시지를 입력하세요",
  chatbot_composer_send: "보내기",
  chatbot_composer_hint: "Enter로 전송, Shift+Enter로 줄바꿈",
  chatbot_typing: "답변을 작성하고 있어요",
  chatbot_suggested_replies: "추천 질문",
  chatbot_new_message: "새 메시지가 도착했어요",
  chatbot_jump_to_newest: "최신 메시지로",
  chatbot_reply_product: "취향에 맞을 것 같은 상품을 골라봤어요.",
  chatbot_reply_order:
    "주문번호를 알려주시면 배송 상태를 확인해 드릴 수 있어요. 마이페이지에서도 바로 확인하실 수 있습니다.",
  chatbot_reply_shipping:
    "대만 내 배송은 보통 2~4 영업일, 해외 배송은 5~10 영업일 정도 걸려요.",
  chatbot_reply_content: "요즘 많이 읽힌 콘텐츠를 모아봤어요.",
  chatbot_reply_fallback:
    "아직 정확히 이해하지 못했어요. 아래에서 골라주시면 바로 도와드릴게요.",
  chatbot_quick_more_products: "다른 상품 더 보기",
  chatbot_quick_shipping_fee: "배송비가 궁금해요",
  chatbot_quick_order_status: "주문 상태 확인",
  chatbot_quick_contact_human: "상담원에게 문의",
  chatbot_view_product: "상품 보기",
  chatbot_view_content: "읽어보기",
  chatbot_products_count: "개 상품",
  chatbot_contents_count: "개 콘텐츠",
  chatbot_error_generic: "답변을 가져오지 못했어요.",
  chatbot_error_network: "네트워크 상태를 확인해 주세요.",
  chatbot_retry: "다시 시도",
  chatbot_reset_thread: "대화 새로 시작",
  chatbot_close: "닫기",
  chatbot_disclaimer: "안내는 참고용이며 실제 주문 정보와 다를 수 있어요.",
} as const;

export type ChatbotCopyKey = keyof typeof ko;

const en: Record<ChatbotCopyKey, string> = {
  chatbot_launcher_label: "Ask us anything",
  chatbot_launcher_open: "Open the Seoul Moment assistant",
  chatbot_launcher_close: "Close the Seoul Moment assistant",
  chatbot_panel_label: "Seoul Moment assistant",
  chatbot_name: "Seoul Moment",
  chatbot_subtitle: "Shopping assistant",
  chatbot_thread_label: "Conversation",
  chatbot_from_assistant: "From Seoul Moment",
  chatbot_from_you: "From you",
  chatbot_greeting:
    "Hi, I'm Seoul Moment. I can suggest products, check your order and delivery, or point you to something worth reading.",
  chatbot_greeting_hint: "Pick a topic below, or just type.",
  chatbot_suggestion_product: "Recommend products for me",
  chatbot_suggestion_order: "Check my order and delivery",
  chatbot_suggestion_shipping: "International shipping",
  chatbot_suggestion_content: "What's worth reading now",
  chatbot_composer_label: "Message",
  chatbot_composer_placeholder: "Type a message",
  chatbot_composer_send: "Send",
  chatbot_composer_hint: "Enter to send, Shift+Enter for a new line",
  chatbot_typing: "Writing a reply",
  chatbot_suggested_replies: "Suggested replies",
  chatbot_new_message: "New message",
  chatbot_jump_to_newest: "Jump to newest",
  chatbot_reply_product: "Here are a few that might suit you.",
  chatbot_reply_order:
    "Share your order number and I'll check the delivery status. You can also see it right away in My Page.",
  chatbot_reply_shipping:
    "Delivery in Taiwan usually takes 2–4 business days, and international shipping 5–10 business days.",
  chatbot_reply_content: "Here's what people have been reading lately.",
  chatbot_reply_fallback:
    "I didn't quite catch that. Pick one below and I'll help right away.",
  chatbot_quick_more_products: "Show me more",
  chatbot_quick_shipping_fee: "How much is shipping?",
  chatbot_quick_order_status: "Check order status",
  chatbot_quick_contact_human: "Talk to a person",
  chatbot_view_product: "View product",
  chatbot_view_content: "Read more",
  chatbot_products_count: " products",
  chatbot_contents_count: " articles",
  chatbot_error_generic: "I couldn't get a reply.",
  chatbot_error_network: "Please check your connection.",
  chatbot_retry: "Try again",
  chatbot_reset_thread: "Start a new chat",
  chatbot_close: "Close",
  chatbot_disclaimer:
    "Answers are for reference and may differ from your actual order.",
};

/** 초안 — 원어민 검수 전. 시트 행이 랜딩되면 시트 값이 이긴다. */
const zhTW: Record<ChatbotCopyKey, string> = {
  chatbot_launcher_label: "有什麼想問的嗎",
  chatbot_launcher_open: "開啟 Seoul Moment 助理",
  chatbot_launcher_close: "關閉 Seoul Moment 助理",
  chatbot_panel_label: "Seoul Moment 助理",
  chatbot_name: "Seoul Moment",
  chatbot_subtitle: "購物小助手",
  chatbot_thread_label: "對話內容",
  chatbot_from_assistant: "Seoul Moment 回覆",
  chatbot_from_you: "我的訊息",
  chatbot_greeting:
    "您好，我是 Seoul Moment。我可以推薦商品、查詢訂單與配送，也能推薦值得一讀的內容。",
  chatbot_greeting_hint: "請從下方選擇，或直接輸入。",
  chatbot_suggestion_product: "為我推薦商品",
  chatbot_suggestion_order: "查詢訂單與配送",
  chatbot_suggestion_shipping: "國際配送說明",
  chatbot_suggestion_content: "近期精選內容",
  chatbot_composer_label: "訊息輸入",
  chatbot_composer_placeholder: "請輸入訊息",
  chatbot_composer_send: "送出",
  chatbot_composer_hint: "Enter 送出，Shift+Enter 換行",
  chatbot_typing: "正在撰寫回覆",
  chatbot_suggested_replies: "建議提問",
  chatbot_new_message: "有新訊息",
  chatbot_jump_to_newest: "前往最新訊息",
  chatbot_reply_product: "為您挑選了幾款可能喜歡的商品。",
  chatbot_reply_order:
    "提供訂單編號即可為您查詢配送狀態，您也可以直接在會員專區查看。",
  chatbot_reply_shipping:
    "台灣境內配送約需 2～4 個工作日，國際配送約需 5～10 個工作日。",
  chatbot_reply_content: "這是最近的熱門內容。",
  chatbot_reply_fallback:
    "我還不太確定您的意思，請從下方選擇，我馬上為您處理。",
  chatbot_quick_more_products: "看更多商品",
  chatbot_quick_shipping_fee: "運費是多少？",
  chatbot_quick_order_status: "查詢訂單狀態",
  chatbot_quick_contact_human: "聯繫真人客服",
  chatbot_view_product: "查看商品",
  chatbot_view_content: "閱讀更多",
  chatbot_products_count: " 件商品",
  chatbot_contents_count: " 篇內容",
  chatbot_error_generic: "無法取得回覆。",
  chatbot_error_network: "請確認網路連線狀態。",
  chatbot_retry: "再試一次",
  chatbot_reset_thread: "開始新對話",
  chatbot_close: "關閉",
  chatbot_disclaimer: "內容僅供參考，可能與實際訂單資訊不同。",
};

/**
 * `satisfies` 로 로케일 누락과 키 누락이 모두 컴파일 에러가 된다.
 * 시트 기반 JSON 은 이 보장을 줄 수 없다.
 */
export const CHATBOT_COPY = {
  ko,
  en,
  "zh-TW": zhTW,
} satisfies Record<LanguageType, Record<ChatbotCopyKey, string>>;
