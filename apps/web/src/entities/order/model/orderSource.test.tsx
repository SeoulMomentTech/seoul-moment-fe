import type { ReactNode } from "react";

import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";

import {
  toOrderHref,
  toOrderSourceBody,
  useOrderSource,
  type OrderSource,
} from "./orderSource";

const readSource = (searchParams: string) =>
  renderHook(() => useOrderSource(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter searchParams={searchParams}>
        {children}
      </NuqsTestingAdapter>
    ),
  }).result.current;

describe("useOrderSource", () => {
  it("?cart= 는 장바구니 라인 주문이다", () => {
    expect(readSource("?cart=1,2,3")).toEqual({
      type: "cart",
      cartItemIds: [1, 2, 3],
    });
  });

  it('?buy= 는 상품상세 "구매하기" 주문이다', () => {
    expect(readSource("?buy=101:1,102:2")).toEqual({
      type: "direct",
      items: [
        { productVariantId: 101, quantity: 1 },
        { productVariantId: 102, quantity: 2 },
      ],
    });
  });

  it("주문 대상이 URL 에 없으면 null 이다", () => {
    expect(readSource("")).toBeNull();
  });

  // 서버가 "둘 중 정확히 하나"를 요구한다. 한쪽을 골라주면 사용자가 고르지 않은 물건이 주문된다
  it("cart 와 buy 가 함께 오면 어느 쪽도 고르지 않는다", () => {
    expect(readSource("?cart=1&buy=101:1")).toBeNull();
  });

  it("예전 링크의 ?items= 는 cartItemId 목록으로 읽는다", () => {
    expect(readSource("?items=1,2")).toEqual({
      type: "cart",
      cartItemIds: [1, 2],
    });
  });

  it("?cart= 가 있으면 예전 ?items= 는 무시한다", () => {
    expect(readSource("?cart=3&items=1,2")).toEqual({
      type: "cart",
      cartItemIds: [3],
    });
  });

  // 성한 쌍만 골라 살리면 사용자가 고르지 않은 수량으로 주문이 만들어진다
  it.each([
    ["수량이 없으면", "?buy=101"],
    ["수량이 0 이면", "?buy=101:0"],
    ["수량이 음수면", "?buy=101:-1"],
    ["숫자가 아니면", "?buy=abc:1"],
    ["한 쌍이라도 깨졌으면", "?buy=101:1,102"],
  ])("%s buy 전체를 버린다", (_, searchParams) => {
    expect(readSource(searchParams)).toBeNull();
  });
});

describe("toOrderSourceBody", () => {
  it("장바구니 주문은 cartItemIds 만 보낸다", () => {
    expect(toOrderSourceBody({ type: "cart", cartItemIds: [1, 2] })).toEqual({
      cartItemIds: [1, 2],
    });
  });

  it('"구매하기" 는 items 만 보낸다', () => {
    const items = [{ productVariantId: 101, quantity: 1 }];

    expect(toOrderSourceBody({ type: "direct", items })).toEqual({ items });
  });
});

describe("toOrderHref", () => {
  it("장바구니 주문은 ?cart= 로 넘긴다", () => {
    expect(toOrderHref({ type: "cart", cartItemIds: [1, 2, 3] })).toBe(
      "/order?cart=1,2,3",
    );
  });

  it('"구매하기" 는 ?buy= 로 넘긴다', () => {
    expect(
      toOrderHref({
        type: "direct",
        items: [
          { productVariantId: 101, quantity: 2 },
          { productVariantId: 102, quantity: 1 },
        ],
      }),
    ).toBe("/order?buy=101:2,102:1");
  });

  // 만드는 쪽과 읽는 쪽이 갈라지면 빈 주문서로만 드러난다. 한 바퀴를 묶어 둔다.
  const roundTrips: Array<[string, OrderSource]> = [
    ["장바구니", { type: "cart", cartItemIds: [1, 2] }],
    [
      "구매하기",
      { type: "direct", items: [{ productVariantId: 101, quantity: 3 }] },
    ],
  ];

  it.each(roundTrips)("%s 링크는 그대로 다시 읽힌다", (_, source) => {
    const href = toOrderHref(source);

    expect(readSource(href.slice(href.indexOf("?")))).toEqual(source);
  });
});
