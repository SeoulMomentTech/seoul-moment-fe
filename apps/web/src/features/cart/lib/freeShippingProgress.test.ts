import { describe, expect, it } from "vitest";

import { getFreeShippingProgress } from "./freeShippingProgress";

describe("getFreeShippingProgress", () => {
  it("기준에 못 미치면 남은 금액과 비율을 준다", () => {
    expect(getFreeShippingProgress({ amount: 600, threshold: 1500 })).toEqual({
      achieved: false,
      remaining: 900,
      ratio: 0.4,
    });
  });

  it("기준을 넘으면 달성이고 비율은 1 로 막힌다", () => {
    expect(getFreeShippingProgress({ amount: 2000, threshold: 1500 })).toEqual({
      achieved: true,
      remaining: 0,
      ratio: 1,
    });
  });

  it("정확히 기준 금액이면 달성이다", () => {
    expect(
      getFreeShippingProgress({ amount: 1500, threshold: 1500 })?.achieved,
    ).toBe(true);
  });

  it("아무것도 고르지 않았으면 달성이 아니라 기준 금액 전체가 남는다", () => {
    expect(getFreeShippingProgress({ amount: 0, threshold: 1500 })).toEqual({
      achieved: false,
      remaining: 1500,
      ratio: 0,
    });
  });

  it("무료배송 기준이 없으면 null", () => {
    expect(getFreeShippingProgress({ amount: 600, threshold: 0 })).toBeNull();
  });
});
