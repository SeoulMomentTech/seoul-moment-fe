import { describe, expect, it } from "vitest";

import { resolveCartSource } from "./cartSource";

describe("resolveCartSource", () => {
  it("복원 전에는 어느 카트인지 말하지 않는다", () => {
    // 인증이 복원되기 전에 게스트로 단정하면 로그인 사용자의 화면이 한 번 비었다 찬다.
    expect(
      resolveCartSource({
        hasAuthHydrated: false,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: null,
      }),
    ).toBeNull();

    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: false,
        guestId: null,
      }),
    ).toBeNull();
  });

  it("로그인했으면 회원 카트다", () => {
    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: true,
        hasGuestHydrated: true,
        guestId: "g-1",
      }),
    ).toEqual({ kind: "member" });
  });

  it("비로그인이면 게스트 카트다 — 담은 적이 없으면 guestId 가 null 이다", () => {
    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: null,
      }),
    ).toEqual({ kind: "guest", guestId: null });

    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: "g-1",
      }),
    ).toEqual({ kind: "guest", guestId: "g-1" });
  });
});
