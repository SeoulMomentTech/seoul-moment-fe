import { describe, expect, it } from "vitest";

import { getBankName } from "./bankName";

describe("getBankName", () => {
  it.each([
    ["004", "臺灣銀行"],
    ["005", "土地銀行"],
    ["012", "台北富邦"],
    ["013", "國泰世華"],
    ["700", "中華郵政"],
    ["808", "玉山銀行"],
    ["812", "台新銀行"],
    ["822", "中國信託"],
  ])("코드 %s → %s", (code, name) => {
    expect(getBankName(code)).toBe(name);
  });

  it("모르는 코드는 그대로", () => {
    expect(getBankName("999")).toBe("999");
  });
});
