import { act } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { render } from "@testing-library/react";

import { CartSessionGuard } from "./CartSessionGuard";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

describe("CartSessionGuard", () => {
  beforeEach(() => {
    replace.mockClear();
    useUserAuthStore.setState({ isAuthenticated: false, hasHydrated: true });
  });

  it("인증이 끊기면 로그인으로 보낸다", () => {
    useUserAuthStore.setState({ isAuthenticated: true, hasHydrated: true });
    render(<CartSessionGuard />);

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: false });
    });

    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("애초에 비로그인이었으면 아무 데도 보내지 않는다", () => {
    render(<CartSessionGuard />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("로그인 상태를 유지하는 동안에는 보내지 않는다", () => {
    useUserAuthStore.setState({ isAuthenticated: true, hasHydrated: true });
    render(<CartSessionGuard />);

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: true });
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("복원(hydrate)이 끝나기 전에는 보내지 않는다", () => {
    useUserAuthStore.setState({ isAuthenticated: true, hasHydrated: false });
    render(<CartSessionGuard />);

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: false, hasHydrated: false });
    });

    expect(replace).not.toHaveBeenCalled();
  });
});
