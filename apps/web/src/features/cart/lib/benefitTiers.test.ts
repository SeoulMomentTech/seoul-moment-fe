import { describe, expect, it } from "vitest";

import { type BenefitTier, getTierProgress } from "./benefitTiers";

const TIERS: BenefitTier[] = [
  { threshold: 3000, discount: 120, freeShipping: true },
  { threshold: 1500, discount: 50, freeShipping: false },
  { threshold: 5000, discount: 250, freeShipping: true },
];

describe("getTierProgress", () => {
  it("구간을 금액순으로 정렬하고 현재·다음 구간 사이 비율을 준다", () => {
    const progress = getTierProgress(4000, TIERS);

    expect(progress?.tiers.map((tier) => tier.threshold)).toEqual([
      1500, 3000, 5000,
    ]);
    expect(progress?.currentIndex).toBe(1);
    expect(progress?.current?.threshold).toBe(3000);
    expect(progress?.next?.threshold).toBe(5000);
    expect(progress?.remaining).toBe(1000);
    expect(progress?.ratio).toBe(0.5);
  });

  it("첫 구간 전이면 현재 구간이 없고 0원부터 잰다", () => {
    const progress = getTierProgress(600, TIERS);

    expect(progress?.currentIndex).toBe(-1);
    expect(progress?.current).toBeNull();
    expect(progress?.from).toBe(0);
    expect(progress?.to).toBe(1500);
    expect(progress?.remaining).toBe(900);
    expect(progress?.ratio).toBe(0.4);
  });

  it("마지막 구간을 넘으면 다음 구간이 없고 바는 가득 찬다", () => {
    const progress = getTierProgress(9000, TIERS);

    expect(progress?.currentIndex).toBe(2);
    expect(progress?.next).toBeNull();
    expect(progress?.remaining).toBe(0);
    expect(progress?.ratio).toBe(1);
  });

  it("정확히 구간 금액이면 그 구간이 현재 구간이다", () => {
    expect(getTierProgress(1500, TIERS)?.currentIndex).toBe(0);
  });

  it("구간이 없으면 null", () => {
    expect(getTierProgress(1000, [])).toBeNull();
  });
});
