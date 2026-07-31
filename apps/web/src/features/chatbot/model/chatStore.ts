import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHAT_STORAGE_KEY, MAX_PERSISTED_MESSAGES } from "./constants";
import type {
  AssistantErrorMessage,
  ChatMessage,
  ChatMessageId,
  UserTextMessage,
} from "./types";

const createId = (): ChatMessageId =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

interface ChatStoreState {
  /** 열림 여부는 저장하지 않는다 — 새 방문이 열린 패널로 시작하면 안 된다. */
  isOpen: boolean;
  hasHydrated: boolean;
  messages: ChatMessage[];
  pendingId: ChatMessageId | null;
  open(): void;
  close(): void;
  toggle(): void;
  appendUserMessage(text: string): UserTextMessage;
  beginPending(): ChatMessageId;
  resolvePending(replies: ChatMessage[]): void;
  failPending(
    retryOf: ChatMessageId,
    reasonKey: AssistantErrorMessage["reasonKey"],
  ): void;
  removeMessage(id: ChatMessageId): void;
  markUserMessageSent(id: ChatMessageId): void;
  reset(): void;
}

// sessionStorage 는 브라우저에서만 접근 가능. SSR 단계에서는 storage 를
// undefined 로 두어 초기 상태 그대로 렌더링되게 한다(useUserAuthStore 와 동일).
//
// localStorage 가 아니라 sessionStorage 인 이유 — "리로드에서 살아남는다"는
// 요구는 충족하면서, 일주일 지난 대화가 낡은 mock 상품과 함께 되살아나는 것은
// 막는다. 사용자가 입력한 문장을 장기 저장소에 남기지 않는 이점도 있다.
const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined;

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      hasHydrated: false,
      messages: [],
      pendingId: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      appendUserMessage: (text) => {
        const message: UserTextMessage = {
          id: createId(),
          createdAt: Date.now(),
          type: "user_text",
          text,
          status: "sent",
        };

        set((state) => ({ messages: [...state.messages, message] }));

        return message;
      },

      beginPending: () => {
        const id = createId();

        set((state) => ({
          pendingId: id,
          messages: [
            ...state.messages,
            { id, createdAt: Date.now(), type: "assistant_pending" },
          ],
        }));

        return id;
      },

      resolvePending: (replies) => {
        const { pendingId } = get();

        set((state) => ({
          pendingId: null,
          messages: state.messages.flatMap((message) =>
            message.id === pendingId ? replies : [message],
          ),
        }));
      },

      failPending: (retryOf, reasonKey) => {
        const { pendingId } = get();
        const error: AssistantErrorMessage = {
          id: createId(),
          createdAt: Date.now(),
          type: "assistant_error",
          reasonKey,
          retryOf,
        };

        set((state) => ({
          pendingId: null,
          messages: state.messages
            .filter((message) => message.id !== pendingId)
            .map((message) =>
              message.id === retryOf && message.type === "user_text"
                ? { ...message, status: "failed" as const }
                : message,
            )
            .concat(error),
        }));
      },

      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        })),

      markUserMessageSent: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id && message.type === "user_text"
              ? { ...message, status: "sent" }
              : message,
          ),
        })),

      reset: () => set({ messages: [], pendingId: null }),
    }),
    {
      name: CHAT_STORAGE_KEY,
      storage,
      /*
       * assistant_pending 을 저장 경계에서 반드시 버린다. 남기면 응답 대기 중
       * 리로드한 사용자에게 영구히 도는 타이핑 인디케이터가 남는다.
       * 대신 아래 onRehydrateStorage 가 답 없는 사용자 턴을 failed 로 바꿔
       * 재시도 버튼을 보여준다.
       */
      partialize: (state) => ({
        messages: state.messages
          .filter((message) => message.type !== "assistant_pending")
          .slice(-MAX_PERSISTED_MESSAGES),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.hasHydrated = true;

        const last = state.messages.at(-1);

        // 마지막이 답을 못 받은 사용자 턴 = 응답 중 리로드. 죽은 스피너 대신
        // 재시도 어포던스를 준다.
        if (last?.type === "user_text") {
          state.messages = state.messages.map((message) =>
            message.id === last.id
              ? { ...message, status: "failed" as const }
              : message,
          );
        }
      },
    },
  ),
);

/**
 * persist rehydrate 완료 여부. SSR 첫 렌더는 false.
 * 스레드에서 파생된 런처 UI(미읽음 배지 등)는 반드시 이 값으로 보호해야
 * 모든 라우트에서 하이드레이션 불일치가 나지 않는다.
 */
export const useChatHydrated = () => useChatStore((s) => s.hasHydrated);
