import { describe, expect, it } from "vitest";

import { getDiscountProgress } from "./discountProgress";

describe("getDiscountProgress", () => {
  it("첫 구간 전이면 할인 없이 다음 구간까지 잰다", () => {
    expect(
      getDiscountProgress({
        amount: 900,
        freeShippingThreshold: 0,
        internationalDiscount: 0,
        nextDiscountThreshold: 1500,
        nextDiscountAmount: 50,
        amountToNextDiscount: 600,
      }),
    ).toEqual({
      applied: 0,
      appliedFreeShipping: false,
      next: {
        threshold: 1500,
        discount: 50,
        remaining: 600,
        freeShipping: false,
      },
      to: 1500,
      ratio: 0.6,
    });
  });

  it("구간 중간이면 지금 할인과 다음 구간을 함께 준다", () => {
    const progress = getDiscountProgress({
      amount: 3640,
      freeShippingThreshold: 0,
      internationalDiscount: 120,
      nextDiscountThreshold: 5000,
      nextDiscountAmount: 250,
      amountToNextDiscount: 1360,
    });

    expect(progress?.applied).toBe(120);
    expect(progress?.next?.remaining).toBe(1360);
    expect(progress?.ratio).toBeCloseTo(0.728);
  });

  it("마지막 구간이면 다음 구간 없이 바를 채운다", () => {
    expect(
      getDiscountProgress({
        amount: 13000,
        freeShippingThreshold: 1150,
        internationalDiscount: 700,
        nextDiscountThreshold: null,
        nextDiscountAmount: null,
        amountToNextDiscount: 0,
      }),
    ).toEqual({
      applied: 700,
      appliedFreeShipping: true,
      next: null,
      to: 13000,
      ratio: 1,
    });
  });

  it("할인액도 다음 구간도 없으면 기능이 꺼진 것으로 본다", () => {
    expect(
      getDiscountProgress({
        amount: 900,
        freeShippingThreshold: 1150,
        internationalDiscount: 0,
        nextDiscountThreshold: null,
        nextDiscountAmount: null,
        amountToNextDiscount: 0,
      }),
    ).toBeNull();
  });

  it("다음 구간이 무료배송 기준을 함께 넘으면 무료배송도 안내한다", () => {
    const progress = getDiscountProgress({
      amount: 900,
      freeShippingThreshold: 1150,
      internationalDiscount: 0,
      nextDiscountThreshold: 1500,
      nextDiscountAmount: 50,
      amountToNextDiscount: 600,
    });

    expect(progress?.next?.freeShipping).toBe(true);
    expect(progress?.appliedFreeShipping).toBe(false);
  });

  it("무료배송을 이미 받고 있거나 기준이 다음 구간보다 높으면 다음 구간에 넣지 않는다", () => {
    const base = {
      internationalDiscount: 120,
      nextDiscountThreshold: 5000,
      nextDiscountAmount: 250,
      amountToNextDiscount: 1360,
    };

    expect(
      getDiscountProgress({
        ...base,
        amount: 3640,
        freeShippingThreshold: 1150,
      })?.next?.freeShipping,
    ).toBe(false);
    expect(
      getDiscountProgress({
        ...base,
        amount: 3640,
        freeShippingThreshold: 6000,
      })?.next?.freeShipping,
    ).toBe(false);
  });
});
