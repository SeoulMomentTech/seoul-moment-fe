import { describe, expect, it } from "vitest";

import { formatAmountInput, parseAmountInput } from "./amountInput";

describe("parseAmountInput", () => {
  it("쉼표를 빼고 숫자로 읽는다", () => {
    expect(parseAmountInput("4,000")).toBe(4000);
  });

  it("숫자가 아닌 글자는 버린다", () => {
    expect(parseAmountInput("NT$ 1a2b3")).toBe(123);
  });

  it("비어 있으면 null", () => {
    expect(parseAmountInput("")).toBeNull();
    expect(parseAmountInput(",")).toBeNull();
  });
});

describe("formatAmountInput", () => {
  it("천 단위로 쉼표를 찍는다", () => {
    expect(formatAmountInput(12000)).toBe("12,000");
  });

  it("null 이면 빈 문자열", () => {
    expect(formatAmountInput(null)).toBe("");
  });
});
