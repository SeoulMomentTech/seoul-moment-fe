import { beforeEach, describe, expect, it } from "vitest";

import { useChatStore } from "./chatStore";
import { MAX_PERSISTED_MESSAGES } from "./constants";
import type { AssistantTextMessage, ChatMessage } from "./types";

const reply = (id: string): AssistantTextMessage => ({
  id,
  createdAt: 0,
  type: "assistant_text",
  textKey: "chatbot_reply_fallback",
});

const types = (messages: ChatMessage[]) => messages.map((m) => m.type);

beforeEach(() => {
  useChatStore.setState({ messages: [], pendingId: null, isOpen: false });
});

describe("chatStore", () => {
  it("사용자 메시지를 sent 상태로 추가한다", () => {
    const message = useChatStore.getState().appendUserMessage("가을 아우터");

    expect(message.type).toBe("user_text");
    expect(message.status).toBe("sent");
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it("beginPending 이 pending 메시지를 붙이고 id 를 추적한다", () => {
    const id = useChatStore.getState().beginPending();

    expect(useChatStore.getState().pendingId).toBe(id);
    expect(types(useChatStore.getState().messages)).toEqual([
      "assistant_pending",
    ]);
  });

  it("resolvePending 이 pending 을 답변들로 교체한다", () => {
    const store = useChatStore.getState();
    store.appendUserMessage("안녕");
    store.beginPending();

    useChatStore.getState().resolvePending([reply("a"), reply("b")]);

    expect(types(useChatStore.getState().messages)).toEqual([
      "user_text",
      "assistant_text",
      "assistant_text",
    ]);
    expect(useChatStore.getState().pendingId).toBeNull();
  });

  it("failPending 이 pending 을 지우고 해당 사용자 턴을 failed 로 바꾼다", () => {
    const store = useChatStore.getState();
    const user = store.appendUserMessage("안녕");
    store.beginPending();

    useChatStore.getState().failPending(user.id, "chatbot_error_network");

    const { messages, pendingId } = useChatStore.getState();

    expect(pendingId).toBeNull();
    expect(types(messages)).toEqual(["user_text", "assistant_error"]);
    expect(messages[0]).toMatchObject({ status: "failed" });
    expect(messages[1]).toMatchObject({
      reasonKey: "chatbot_error_network",
      retryOf: user.id,
    });
  });

  it("markUserMessageSent 가 재시도 성공 시 failed 를 되돌린다", () => {
    const store = useChatStore.getState();
    const user = store.appendUserMessage("안녕");
    store.failPending(user.id, "chatbot_error_generic");

    useChatStore.getState().markUserMessageSent(user.id);

    expect(useChatStore.getState().messages[0]).toMatchObject({
      status: "sent",
    });
  });

  it("reset 이 스레드를 비우되 열림 상태는 유지한다", () => {
    useChatStore.setState({ isOpen: true });
    useChatStore.getState().appendUserMessage("안녕");

    useChatStore.getState().reset();

    expect(useChatStore.getState().messages).toEqual([]);
    expect(useChatStore.getState().isOpen).toBe(true);
  });

  it("저장 대상에서 pending 을 제외하고 최근 N개로 캡한다", () => {
    // partialize 는 persist 옵션이라 직접 꺼내 쓸 수 없으므로 같은 규칙을 검증한다.
    const many: ChatMessage[] = Array.from(
      { length: MAX_PERSISTED_MESSAGES + 10 },
      (_, index) => reply(`r${index}`),
    );

    useChatStore.setState({
      messages: [...many, { id: "p", createdAt: 0, type: "assistant_pending" }],
    });

    const stored: ChatMessage[] = useChatStore.getState().messages;
    const persisted = stored
      .filter((message) => message.type !== "assistant_pending")
      .slice(-MAX_PERSISTED_MESSAGES);

    expect(stored.map((m) => m.type)).toContain("assistant_pending");
    expect(persisted).toHaveLength(MAX_PERSISTED_MESSAGES);
    expect(persisted.map((m) => m.type)).not.toContain("assistant_pending");
    expect(persisted.at(-1)?.id).toBe(`r${MAX_PERSISTED_MESSAGES + 9}`);
  });
});
