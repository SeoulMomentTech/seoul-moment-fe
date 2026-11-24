import { describe, expect, it } from "vitest";

import { buildPolicyPatch } from "./policyPatch";

const saved = { freeShippingThreshold: 1150, internationalDiscountEnabled: false };

describe("buildPolicyPatch", () => {
  it("바뀐 키만 담는다", () => {
    expect(
      buildPolicyPatch(saved, {
        freeShippingThreshold: 4000,
        internationalDiscountEnabled: false,
      }),
    ).toEqual({ freeShippingThreshold: 4000 });
  });

  it("둘 다 바뀌면 둘 다 담는다", () => {
    expect(
      buildPolicyPatch(saved, {
        freeShippingThreshold: 4000,
        internationalDiscountEnabled: true,
      }),
    ).toEqual({ freeShippingThreshold: 4000, internationalDiscountEnabled: true });
  });

  it("바뀐 게 없으면 빈 객체", () => {
    expect(buildPolicyPatch(saved, { ...saved })).toEqual({});
  });
});
