import { describe, expect, it } from "vitest";

import { toTaipeiDate } from "./taipeiDate";

describe("toTaipeiDate", () => {
  it("UTC 16시 이후는 대만에서 다음 날이다", () => {
    expect(toTaipeiDate(new Date("2026-11-23T16:30:00Z"))).toBe("2026-11-24");
  });

  it("UTC 16시 전이면 같은 날이다", () => {
    expect(toTaipeiDate(new Date("2026-11-23T15:59:00Z"))).toBe("2026-11-23");
  });
});
