import { describe, expect, it } from "vitest";

import { TAIWAN_DIAL_CODE, toTaiwanPhoneNumber } from "./utils";

describe("toTaiwanPhoneNumber", () => {
  it("선행 0을 제거하고 +886을 결합한다", () => {
    expect(toTaiwanPhoneNumber("0912345678")).toBe("+886912345678");
  });

  it("선행 0이 없는 로컬 번호에 +886을 결합한다", () => {
    expect(toTaiwanPhoneNumber("912345678")).toBe("+886912345678");
  });

  it("이미 886이 포함된 번호를 중복 없이 정규화한다", () => {
    expect(toTaiwanPhoneNumber("886912345678")).toBe("+886912345678");
  });

  it("+886이 포함된 번호를 중복 없이 정규화한다", () => {
    expect(toTaiwanPhoneNumber("+886912345678")).toBe("+886912345678");
  });

  it("공백과 하이픈 등 비숫자 문자를 제거한다", () => {
    expect(toTaiwanPhoneNumber("0912-345-678")).toBe("+886912345678");
    expect(toTaiwanPhoneNumber(" 09 1234 5678 ")).toBe("+886912345678");
  });

  it("빈 문자열은 국가 번호만 반환한다", () => {
    expect(toTaiwanPhoneNumber("")).toBe(TAIWAN_DIAL_CODE);
  });
});
