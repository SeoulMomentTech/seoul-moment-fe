import { useChatbotCopy } from "../model/useChatbotCopy";

/**
 * 어시스턴트는 실제 주문 데이터를 조회하지 못한다(PRODUCT.md: 미정).
 * 안내가 확정된 사실처럼 읽히지 않도록 표면에 그 한계를 적어 둔다.
 */
export function ChatDisclaimer() {
  const copy = useChatbotCopy();

  return (
    <p className="text-body-5 border-t border-black/5 px-4 py-2 text-black/60">
      {copy("chatbot_disclaimer")}
    </p>
  );
}
