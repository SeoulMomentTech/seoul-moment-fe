import { beforeEach, describe, expect, it } from "vitest";

import {
  clearSnsSignupContext,
  consumeLineLoginPending,
  markLineLoginPending,
  readSnsSignupContext,
  saveSnsSignupContext,
} from "./snsAuthStorage";

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("saveSnsSignupContext / readSnsSignupContext", () => {
  it("provider와 이메일을 함께 저장하고 그대로 읽는다", () => {
    saveSnsSignupContext({
      provider: "line",
      signupToken: "token",
      email: "test@test.com",
    });

    expect(readSnsSignupContext()).toEqual({
      provider: "line",
      signupToken: "token",
      email: "test@test.com",
    });
  });

  it("이메일이 없어도 컨텍스트를 반환한다", () => {
    saveSnsSignupContext({ provider: "line", signupToken: "token" });

    expect(readSnsSignupContext()).toEqual({
      provider: "line",
      signupToken: "token",
      email: undefined,
    });
  });

  it("이메일을 생략하면 이전에 저장된 이메일이 남지 않는다", () => {
    saveSnsSignupContext({
      provider: "google",
      signupToken: "token",
      email: "stale@test.com",
    });
    saveSnsSignupContext({ provider: "line", signupToken: "token" });

    expect(readSnsSignupContext()?.email).toBeUndefined();
  });

  it("signupToken이 없으면 null을 반환한다", () => {
    expect(readSnsSignupContext()).toBeNull();
  });

  it("provider 키가 없는 과거 세션은 google로 폴백한다", () => {
    window.sessionStorage.setItem("sns:signupToken", "token");
    window.sessionStorage.setItem("sns:signupEmail", "test@test.com");

    expect(readSnsSignupContext()?.provider).toBe("google");
  });

  it("알 수 없는 provider 값도 google로 폴백한다", () => {
    window.sessionStorage.setItem("sns:provider", "kakao");
    window.sessionStorage.setItem("sns:signupToken", "token");

    expect(readSnsSignupContext()?.provider).toBe("google");
  });
});

describe("clearSnsSignupContext", () => {
  it("provider·토큰·이메일을 모두 제거한다", () => {
    saveSnsSignupContext({
      provider: "line",
      signupToken: "token",
      email: "test@test.com",
    });

    clearSnsSignupContext();

    expect(readSnsSignupContext()).toBeNull();
    expect(window.sessionStorage.getItem("sns:provider")).toBeNull();
    expect(window.sessionStorage.getItem("sns:signupEmail")).toBeNull();
  });
});

describe("markLineLoginPending / consumeLineLoginPending", () => {
  it("표시하지 않았으면 false를 반환한다", () => {
    expect(consumeLineLoginPending()).toBe(false);
  });

  it("표시한 뒤 첫 호출만 true이고 이후에는 false다", () => {
    markLineLoginPending();

    expect(consumeLineLoginPending()).toBe(true);
    expect(consumeLineLoginPending()).toBe(false);
  });

  it("가입 컨텍스트를 지워도 pending 플래그는 남는다", () => {
    markLineLoginPending();
    clearSnsSignupContext();

    expect(consumeLineLoginPending()).toBe(true);
  });
});
