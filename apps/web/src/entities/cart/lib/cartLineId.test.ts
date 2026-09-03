import { describe, expect, it } from "vitest";

import {
  createCartLineId,
  formatCartLineOptions,
  getProductIdFromCartLineId,
} from "./cartLineId";
import type { CartOptionSelection } from "../model/types";

const opt = (
  optionValueId: number,
  value: string,
  type: CartOptionSelection["type"] = "COLOR",
): CartOptionSelection => ({ type, optionValueId, value });

describe("createCartLineId", () => {
  it("옵션을 고른 순서가 달라도 같은 id", () => {
    const a = createCartLineId(10, [opt(7, "NAVY"), opt(3, "M", "SIZE")]);
    const b = createCartLineId(10, [opt(3, "M", "SIZE"), opt(7, "NAVY")]);

    expect(a).toBe(b);
  });

  it("옵션 조합이 다르면 다른 id", () => {
    expect(createCartLineId(10, [opt(3, "M", "SIZE")])).not.toBe(
      createCartLineId(10, [opt(4, "L", "SIZE")]),
    );
  });

  it("상품이 다르면 다른 id", () => {
    expect(createCartLineId(10, [opt(3, "M")])).not.toBe(
      createCartLineId(11, [opt(3, "M")]),
    );
  });

  it("옵션이 없는 상품도 id 를 만든다", () => {
    expect(createCartLineId(10, [])).toBe("10:");
  });
});

describe("getProductIdFromCartLineId", () => {
  it("productId 를 복원한다", () => {
    expect(getProductIdFromCartLineId("1042:3-7")).toBe(1042);
    expect(getProductIdFromCartLineId("1042:")).toBe(1042);
  });

  it("형식이 깨지면 null", () => {
    expect(getProductIdFromCartLineId("abc:1")).toBeNull();
    expect(getProductIdFromCartLineId("")).toBeNull();
  });
});

describe("formatCartLineOptions", () => {
  it("슬래시로 잇는다", () => {
    expect(formatCartLineOptions([opt(1, "IVORY"), opt(2, "M", "SIZE")])).toBe(
      "IVORY / M",
    );
  });

  it("옵션이 없으면 빈 문자열", () => {
    expect(formatCartLineOptions([])).toBe("");
  });
});
