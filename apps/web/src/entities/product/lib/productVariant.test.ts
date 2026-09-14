import { describe, expect, it } from "vitest";

import type { ProductVariant } from "@shared/services/product";

import {
  findProductVariant,
  isProductSoldOut,
  listProductVariantChoices,
} from "./productVariant";

const variant = (id: number, optionValueIds: number[]): ProductVariant => ({
  id,
  sku: `SKU-${id}`,
  optionValueIds,
  stockQuantity: 5,
  isSoldOut: false,
});

describe("findProductVariant", () => {
  const variants = [
    variant(101, [1, 5]),
    variant(102, [1, 6]),
    variant(103, [3]),
  ];

  it("옵션값 조합이 일치하는 SKU를 찾는다", () => {
    expect(findProductVariant(variants, [1, 6])?.id).toBe(102);
  });

  it("고른 순서가 달라도 같은 SKU로 본다", () => {
    expect(findProductVariant(variants, [6, 1])?.id).toBe(102);
  });

  it("축이 하나인 조합도 찾는다", () => {
    expect(findProductVariant(variants, [3])?.id).toBe(103);
  });

  // 서버가 상품당 조합 1개에 모든 옵션값을 합집합으로 담아 주는 동안에도 담을 수 있어야 한다.
  it("정확 일치가 없으면 선택값을 모두 포함하는 조합으로 후퇴한다", () => {
    expect(
      findProductVariant([variant(170, [55, 41, 1, 2])], [55, 41, 1])?.id,
    ).toBe(170);
  });

  it("후퇴할 때는 포함 개수가 가장 적은 조합을 고른다", () => {
    const wide = variant(200, [1, 5, 6, 7]);
    expect(findProductVariant([wide, variant(201, [1, 5])], [1])?.id).toBe(201);
  });

  it("어떤 조합에도 포함되지 않으면 null", () => {
    expect(findProductVariant(variants, [1, 5, 6])).toBeNull();
  });

  it("선택이 비었거나 variants가 없으면 null", () => {
    expect(findProductVariant(variants, [])).toBeNull();
    expect(findProductVariant([], [1, 5])).toBeNull();
  });
});

describe("listProductVariantChoices", () => {
  const option = {
    SIZE: [
      { id: 41, value: "S" },
      { id: 42, value: "M" },
    ],
    COLOR: [{ id: 55, value: "블루" }],
    COUNTRY_OF_ORIGIN: [{ id: 3, value: "중국" }],
  } as Parameters<typeof listProductVariantChoices>[0]["option"];

  it("축 순서대로 라벨을 만들고 라벨 키가 없는 축은 제외한다", () => {
    const [choice] = listProductVariantChoices({
      option,
      // 서버 배열 순서를 일부러 뒤섞고 매핑 없는 축(원산지 3)도 섞는다.
      variants: [variant(101, [41, 3, 55])],
    });

    // OPTION_AXIS_ORDER 가 COLOR -> SIZE 이므로 색상이 먼저다. 원산지는 빠진다.
    expect(choice.label).toBe("블루 / S");
    expect(choice.options.map((o) => o.optionValueId)).toEqual([55, 41]);
  });

  // 실서버 현재 응답: 상품당 조합 1개에 한 축의 값이 여러 개 들어온다(혼방 소재).
  // 값을 그냥 이으면 `나일론 / 스판덱스` 가 되어 고를 수 있는 두 축처럼 읽힌다.
  it("한 축에 값이 여러 개면 축 안에서 묶어 한 칸으로 만든다", () => {
    const [choice] = listProductVariantChoices({
      option: {
        COLOR: [{ id: 55, value: "사파이어 블루" }],
        SIZE: [{ id: 41, value: "FREE" }],
        MATERIAL: [
          { id: 1, value: "나일론" },
          { id: 2, value: "스판덱스" },
        ],
      },
      variants: [variant(170, [55, 41, 1, 2])],
    });

    expect(choice.label).toBe("사파이어 블루 / FREE / 나일론·스판덱스");
    expect(choice.options.map((o) => o.optionValueId)).toEqual([55, 41, 1, 2]);
  });

  it("품절·재고 0 조합은 구매 불가로 표시한다", () => {
    const choices = listProductVariantChoices({
      option,
      variants: [
        { ...variant(101, [55, 41]), isSoldOut: true },
        { ...variant(102, [55, 42]), stockQuantity: 0 },
      ],
    });

    expect(choices.map((c) => c.isPurchasable)).toEqual([false, false]);
  });
});

describe("isProductSoldOut", () => {
  it("살 수 있는 조합이 하나라도 있으면 품절이 아니다", () => {
    expect(
      isProductSoldOut([
        { ...variant(101, [1]), isSoldOut: true },
        variant(102, [2]),
      ]),
    ).toBe(false);
  });

  it("모든 조합이 품절이거나 재고 0이면 품절이다", () => {
    expect(
      isProductSoldOut([
        { ...variant(101, [1]), isSoldOut: true },
        { ...variant(102, [2]), stockQuantity: 0 },
      ]),
    ).toBe(true);
  });

  // 재고를 모르는 것과 없는 것은 다르다. 막으면 축별 선택 상품이 통째로 구매 불가가 된다.
  it("variants 를 못 받았으면 품절로 보지 않는다", () => {
    expect(isProductSoldOut([])).toBe(false);
  });
});
