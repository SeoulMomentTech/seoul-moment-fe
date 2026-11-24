import { describe, expect, it } from "vitest";

import { isSidebarItemActive } from "./navigation";

describe("isSidebarItemActive", () => {
  it("경로가 같으면 활성", () => {
    expect(isSidebarItemActive("/mypage/order", "/mypage/order")).toBe(true);
  });

  it("하위 경로(주문 상세)에서도 활성", () => {
    expect(isSidebarItemActive("/mypage/order/481", "/mypage/order")).toBe(
      true,
    );
  });

  it("접두어만 같은 다른 경로는 비활성", () => {
    expect(isSidebarItemActive("/mypage/orders", "/mypage/order")).toBe(false);
    expect(isSidebarItemActive("/mypage/interest", "/mypage/order")).toBe(
      false,
    );
  });
});
