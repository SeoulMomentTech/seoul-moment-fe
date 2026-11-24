import { describe, expect, it } from "vitest";

import { formatRemaining, getRemainingSeconds } from "./remainingTime";

describe("formatRemaining", () => {
  it("시간과 분으로 적는다", () => {
    expect(formatRemaining(5 * 3600 + 12 * 60 + 30)).toBe("5시간 12분 남음");
  });

  it("1시간 미만이면 분만 적는다", () => {
    expect(formatRemaining(45 * 60)).toBe("45분 남음");
  });

  it("1분 미만이 남으면 1분 미만으로 적는다", () => {
    expect(formatRemaining(30)).toBe("1분 미만 남음");
  });

  it("0 이하면 null", () => {
    expect(formatRemaining(0)).toBeNull();
    expect(formatRemaining(-5)).toBeNull();
  });
});

describe("getRemainingSeconds", () => {
  it("서버가 준 남은 초에서 받은 뒤 지난 시간만큼 깎는다", () => {
    expect(getRemainingSeconds(600, 1_000, 1_000 + 90_000)).toBe(510);
  });

  it("0 아래로 내려가지 않는다", () => {
    expect(getRemainingSeconds(60, 0, 120_000)).toBe(0);
  });
});
