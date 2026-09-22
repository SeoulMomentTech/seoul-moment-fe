import { act } from "react";

import { beforeEach, describe, expect, it } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { render } from "@testing-library/react";

import { GuestCartReset } from "./GuestCartReset";
import { useGuestCartIdStore } from "../model/guestId";

describe("GuestCartReset", () => {
  beforeEach(() => {
    useUserAuthStore.setState({ isAuthenticated: false });
    useGuestCartIdStore.setState({ guestId: "g-1" });
  });

  it("로그인하면 게스트 ID 를 버린다", () => {
    render(<GuestCartReset />);
    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: true });
    });

    expect(useGuestCartIdStore.getState().guestId).toBeNull();
  });

  it("이미 로그인된 상태로 마운트해도 건드리지 않는다", () => {
    // 마운트 시점에 이미 인증돼 있으면 false→true 전환이 아니므로 지우면 안 된다.
    // RTL 의 render() 는 마운트 effect 를 동기적으로 flush 하므로, render() 직후 값을
    // 바로 확인해야 한다 — 이후에 다시 seed 하면 마운트 시 지워졌던 손상이 가려진다.
    useUserAuthStore.setState({ isAuthenticated: true });

    render(<GuestCartReset />);

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });

  it("로그아웃으로 전환되어도 건드리지 않는다", () => {
    // 게스트로 담아둔 것이 있으면 로그아웃 후 그 카트로 돌아온다.
    useUserAuthStore.setState({ isAuthenticated: true });
    render(<GuestCartReset />);

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: false });
    });

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });
});
