import { describe, expect, it } from "vitest";

import { canUseSuperAdminApi, toPermissionPatch } from "./permission";

describe("toPermissionPatch", () => {
  const user = { role: "admin", status: "WAIT" } as const;

  it("바뀐 필드만 담는다", () => {
    expect(
      toPermissionPatch(user, { role: "admin", status: "NORMAL" }),
    ).toEqual({ status: "NORMAL" });
    expect(
      toPermissionPatch(user, { role: "super_admin", status: "WAIT" }),
    ).toEqual({ role: "super_admin" });
  });

  it("둘 다 바뀌면 둘 다 보낸다", () => {
    expect(
      toPermissionPatch(user, { role: "super_admin", status: "NORMAL" }),
    ).toEqual({ role: "super_admin", status: "NORMAL" });
  });

  it("바뀐 게 없으면 빈 객체다", () => {
    expect(toPermissionPatch(user, user)).toEqual({});
  });
});

describe("canUseSuperAdminApi", () => {
  it("super_admin 이면서 NORMAL 일 때만 참이다", () => {
    expect(canUseSuperAdminApi({ role: "super_admin", status: "NORMAL" })).toBe(
      true,
    );
    expect(canUseSuperAdminApi({ role: "super_admin", status: "WAIT" })).toBe(
      false,
    );
    expect(canUseSuperAdminApi({ role: "admin", status: "NORMAL" })).toBe(
      false,
    );
  });
});
