import { beforeEach, describe, expect, it } from "vitest";

import { useGuestCartIdStore } from "./guestId";

describe("guestId store", () => {
  beforeEach(() => {
    useGuestCartIdStore.setState({ guestId: null });
  });

  it("발급받은 ID 를 보관한다", () => {
    useGuestCartIdStore.getState().setGuestId("g-1");

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });

  it("폐기하면 null 로 돌아간다", () => {
    useGuestCartIdStore.getState().setGuestId("g-1");
    useGuestCartIdStore.getState().clearGuestId();

    expect(useGuestCartIdStore.getState().guestId).toBeNull();
  });

  it("같은 ID 를 다시 저장해도 상태 객체가 바뀌지 않는다", () => {
    // 담기 응답마다 저장하므로, 매번 새 참조를 만들면 구독자가 불필요하게 다시 그린다.
    useGuestCartIdStore.getState().setGuestId("g-1");
    const before = useGuestCartIdStore.getState();

    useGuestCartIdStore.getState().setGuestId("g-1");

    expect(useGuestCartIdStore.getState()).toBe(before);
  });
});
