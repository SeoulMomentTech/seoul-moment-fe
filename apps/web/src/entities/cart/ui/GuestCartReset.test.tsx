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

  it("로그아웃에서는 건드리지 않는다", () => {
    // 게스트로 담아둔 것이 있으면 로그아웃 후 그 카트로 돌아온다.
    useUserAuthStore.setState({ isAuthenticated: true });
    render(<GuestCartReset />);
    useGuestCartIdStore.setState({ guestId: "g-1" });

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: false });
    });

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });
});
