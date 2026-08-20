import { describe, expect, it } from "vitest";

import { isSnsTokenExpired } from "./snsToken";

/** exp 클레임만 담은 서명 없는 JWT. 검증은 서버가 하므로 형식만 맞으면 된다. */
const tokenWithExp = (expSec: number) => {
  const payload = btoa(JSON.stringify({ exp: expSec }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
};

const nowSec = () => Math.floor(Date.now() / 1000);

describe("isSnsTokenExpired", () => {
  it("만료가 아직 남은 토큰은 false다", () => {
    expect(isSnsTokenExpired(tokenWithExp(nowSec() + 600))).toBe(false);
  });

  it("이미 만료된 토큰은 true다", () => {
    expect(isSnsTokenExpired(tokenWithExp(nowSec() - 1))).toBe(true);
  });

  it("곧 만료될 토큰은 서버 왕복을 감안해 미리 만료로 본다", () => {
    expect(isSnsTokenExpired(tokenWithExp(nowSec() + 3))).toBe(true);
  });

  it("exp가 없는 토큰은 만료로 취급한다", () => {
    const payload = btoa(JSON.stringify({ sub: "line-user" }));
    expect(isSnsTokenExpired(`header.${payload}.signature`)).toBe(true);
  });

  it("JWT 형식이 아니면 만료로 취급한다", () => {
    expect(isSnsTokenExpired("not-a-jwt")).toBe(true);
  });
});
