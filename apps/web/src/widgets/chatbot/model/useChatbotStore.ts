import { create } from "zustand";

import type { ChatbotMessage } from "./types";

interface ChatbotState {
  isOpen: boolean;
  messages: ChatbotMessage[];
  /**
   * 대화가 만들어진 언어. 언어 변경 감지를 컴포넌트 `useRef` 로 하면
   * `[locale]` 세그먼트가 바뀔 때 런처가 리마운트되어 비교가 무력화되므로
   * 리마운트와 무관하게 살아 있는 스토어에 둔다.
   */
  languageCode: string | null;
  /**
   * 레이트리밋이 풀리는 시각(epoch ms). 서버가 대기 시간을 주지 않으므로
   * (`ask` 응답 스키마에 해당 필드가 없다) 클라이언트가 정한 값으로 둔다.
   */
  rateLimitedUntil: number | null;
  open(): void;
  close(): void;
  toggle(): void;
  setLanguageCode(languageCode: string): void;
  startRateLimit(durationMs: number): void;
  clearRateLimit(): void;
  addMessage(message: ChatbotMessage): void;
  markLastUserMessageFailed(): void;
  removeMessage(id: string): void;
  reset(): void;
}

/**
 * 챗봇 대화 상태.
 *
 * `persist` 를 쓰지 않는다. 대화를 브라우저에 남기지 않기로 정했으므로(세션 한정)
 * 순수 메모리 상태여야 하고, 덕분에 hydration 불일치도 발생하지 않는다.
 * 라우트 이동 중에는 이 스토어가 살아 있어 대화가 유지된다.
 */
export const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  messages: [],
  languageCode: null,
  rateLimitedUntil: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setLanguageCode: (languageCode) => set({ languageCode }),
  startRateLimit: (durationMs) =>
    set({ rateLimitedUntil: Date.now() + durationMs }),
  clearRateLimit: () => set({ rateLimitedUntil: null }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  markLastUserMessageFailed: () =>
    set((state) => {
      const lastUserIndex = state.messages.findLastIndex(
        (message) => message.role === "user",
      );

      if (lastUserIndex === -1) return state;

      const messages = [...state.messages];
      messages[lastUserIndex] = { ...messages[lastUserIndex], failed: true };

      return { messages };
    }),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
  reset: () => set({ messages: [], rateLimitedUntil: null }),
}));
