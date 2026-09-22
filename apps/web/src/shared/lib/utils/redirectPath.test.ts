import { describe, expect, it } from "vitest";

import { resolveRedirectPath } from "./redirectPath";

describe("resolveRedirectPath", () => {
  it("내부 절대 경로는 그대로 통과시킨다", () => {
    expect(resolveRedirectPath("/cart")).toBe("/cart");
  });

  it("값이 없으면 기본값으로 떨어진다", () => {
    expect(resolveRedirectPath(null)).toBe("/");
    expect(resolveRedirectPath(undefined)).toBe("/");
  });

  it("프로토콜 상대 URL(//evil.com)은 기본값으로 떨어진다", () => {
    // "//evil.com" 은 브라우저가 현재 프로토콜을 붙여 외부 호스트로 해석한다.
    expect(resolveRedirectPath("//evil.com")).toBe("/");
  });

  it("절대 URL(https://...)은 기본값으로 떨어진다", () => {
    expect(resolveRedirectPath("https://evil.example")).toBe("/");
  });
});
