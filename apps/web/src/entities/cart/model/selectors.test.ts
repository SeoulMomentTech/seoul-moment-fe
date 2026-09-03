import { describe, expect, it } from "vitest";

import {
  getCartLineAmount,
  getCartLineUnitPrice,
  groupCartLinesByBrand,
  sumCartAmount,
} from "./selectors";
import type { CartLine } from "./types";

const line = (
  over: Partial<CartLine> & Pick<CartLine, "lineId">,
): CartLine => ({
  productId: 1,
  quantity: 1,
  addedAt: 0,
  productName: "상품",
  brandId: "b1",
  brandName: "온도",
  brandProfileImg: "",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  options: [],
  external: [],
  ...over,
});

describe("getCartLineUnitPrice", () => {
  it("할인가가 유효하면 할인가", () => {
    expect(
      getCartLineUnitPrice(
        line({ lineId: "a", price: 1600, discountPrice: 1280 }),
      ),
    ).toBe(1280);
  });

  it("할인가가 0이면 정상가", () => {
    expect(
      getCartLineUnitPrice(
        line({ lineId: "a", price: 1600, discountPrice: 0 }),
      ),
    ).toBe(1600);
  });

  it("할인가가 정상가보다 크면 정상가 (서버 데이터 방어)", () => {
    expect(
      getCartLineUnitPrice(
        line({ lineId: "a", price: 1000, discountPrice: 2000 }),
      ),
    ).toBe(1000);
  });
});

describe("getCartLineAmount", () => {
  it("단가 x 수량", () => {
    expect(
      getCartLineAmount(
        line({ lineId: "a", price: 1600, discountPrice: 1280, quantity: 2 }),
      ),
    ).toBe(2560);
  });
});

describe("sumCartAmount", () => {
  const lines = [
    line({ lineId: "a", price: 1600, discountPrice: 1280, quantity: 2 }),
    line({ lineId: "b", price: 2200, quantity: 1 }),
    line({ lineId: "c", price: 1340, quantity: 1 }),
  ];

  it("선택된 라인만 더한다", () => {
    expect(sumCartAmount(lines, new Set(["a", "c"]))).toBe(3900);
  });

  it("선택이 없으면 0", () => {
    expect(sumCartAmount(lines, new Set())).toBe(0);
  });
});

describe("groupCartLinesByBrand", () => {
  it("브랜드로 묶고 선택된 라인만 소계에 넣는다", () => {
    const groups = groupCartLinesByBrand(
      [
        line({
          lineId: "a",
          brandId: "b1",
          addedAt: 1,
          price: 1280,
          quantity: 2,
        }),
        line({ lineId: "b", brandId: "b1", addedAt: 2, price: 2200 }),
        line({
          lineId: "c",
          brandId: "b2",
          addedAt: 3,
          price: 1340,
          brandName: "MOONREST",
        }),
      ],
      new Set(["a", "c"]),
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].brandId).toBe("b1");
    expect(groups[0].lines.map((l) => l.lineId)).toEqual(["a", "b"]);
    expect(groups[0].selectedAmount).toBe(2560);
    expect(groups[1].brandName).toBe("MOONREST");
    expect(groups[1].selectedAmount).toBe(1340);
  });

  it("그룹 순서는 가장 오래된 라인 기준 - 담을 때마다 튀지 않는다", () => {
    const groups = groupCartLinesByBrand(
      [
        line({ lineId: "new", brandId: "b2", addedAt: 100 }),
        line({ lineId: "old", brandId: "b1", addedAt: 1 }),
      ],
      new Set(),
    );

    expect(groups.map((g) => g.brandId)).toEqual(["b1", "b2"]);
  });

  it("빈 목록은 빈 배열", () => {
    expect(groupCartLinesByBrand([], new Set())).toEqual([]);
  });
});
