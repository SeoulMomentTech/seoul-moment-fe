import { describe, expect, it } from "vitest";

import { formatTaipeiDateTime } from "./taipeiTime";

describe("formatTaipeiDateTime", () => {
  it("UTC 를 대만 시각(+8)으로 바꾼다", () => {
    expect(formatTaipeiDateTime("2026-11-06T15:59:59Z")).toBe(
      "2026/11/06 23:59",
    );
  });

  it("자정을 넘기면 날짜가 바뀐다", () => {
    expect(formatTaipeiDateTime("2026-11-06T16:30:00Z")).toBe(
      "2026/11/07 00:30",
    );
  });

  it("한 자리 월·일·시·분은 0 을 채운다", () => {
    expect(formatTaipeiDateTime("2026-01-05T01:05:00Z")).toBe(
      "2026/01/05 09:05",
    );
  });

  it("읽을 수 없는 값은 그대로 돌려준다", () => {
    expect(formatTaipeiDateTime("nope")).toBe("nope");
  });
});
