import { beforeEach, describe, expect, it } from "vitest";

import {
  clearSnsSignupContext,
  consumeLineLoginPending,
  isSnsSignupReady,
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

    expect(readSnsSignupContext()).toEqual({
      provider: "line",
      signupToken: "token",
      email: undefined,
    });
  });

  it("토큰이 하나도 없으면 null을 반환한다", () => {
    expect(readSnsSignupContext()).toBeNull();
  });

  it("emailToken만 저장한 이메일 인증 대기 상태를 그대로 읽는다", () => {
    saveSnsSignupContext({ provider: "line", emailToken: "email-token" });

    const context = readSnsSignupContext();

    expect(context).toEqual({ provider: "line", emailToken: "email-token" });
    expect(context && isSnsSignupReady(context)).toBe(false);
  });

  it("이메일 인증 대기 상태는 이전 단계의 signupToken·이메일을 남기지 않는다", () => {
    saveSnsSignupContext({
      provider: "line",
      signupToken: "stale-token",
      email: "stale@test.com",
    });

    saveSnsSignupContext({ provider: "line", emailToken: "email-token" });

    expect(readSnsSignupContext()).toEqual({
      provider: "line",
      emailToken: "email-token",
    });
  });

  it("인증을 마쳐 signupToken을 저장하면 emailToken이 남지 않는다", () => {
    saveSnsSignupContext({ provider: "line", emailToken: "email-token" });

    saveSnsSignupContext({
      provider: "line",
      signupToken: "signup-token",
      email: "verified@test.com",
    });

    const context = readSnsSignupContext();

    expect(context).toEqual({
      provider: "line",
      signupToken: "signup-token",
      email: "verified@test.com",
    });
    expect(context && isSnsSignupReady(context)).toBe(true);
    expect(window.sessionStorage.getItem("sns:emailToken")).toBeNull();
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

  it("이메일 인증 대기 상태도 제거한다", () => {
    saveSnsSignupContext({ provider: "line", emailToken: "email-token" });

    clearSnsSignupContext();

    expect(readSnsSignupContext()).toBeNull();
    expect(window.sessionStorage.getItem("sns:emailToken")).toBeNull();
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
