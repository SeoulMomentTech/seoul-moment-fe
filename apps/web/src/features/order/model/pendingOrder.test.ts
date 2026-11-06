import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PostUserOrderPreviewRes } from "@shared/services/userOrder";

import type { CreateUserOrderVariables } from "@entities/order";

import {
  clearPendingOrder,
  findPendingOrder,
  PENDING_ORDER_KEY,
  PENDING_ORDER_TTL_MS,
  savePendingOrder,
  toPendingBodyKey,
  updatePendingOrder,
  type PendingOrder,
} from "./pendingOrder";

const body: CreateUserOrderVariables = {
  cartItemIds: [12, 13],
  paymentMethod: "ECPAY",
  shippingType: "HOME",
  useDefaultShipping: true,
};

const line = (productVariantId: number, quantity: number) => ({
  cartItemId: null,
  productItemId: 1,
  productVariantId,
  productName: "p",
  optionText: "o",
  imageUrl: "",
  price: 100,
  quantity,
  totalPrice: 100 * quantity,
  stockQuantity: 9,
  isSoldOut: false,
  isAvailable: true,
});

const preview = (lines: Array<[number, number]>, totalAmount = 1160) =>
  ({
    brandGroups: [
      { brandId: 1, brandName: "b", items: lines.map(([v, q]) => line(v, q)) },
    ],
    totalProductAmount: 1100,
    shippingFee: 60,
    isRemoteIsland: false,
    isShippingEstimated: false,
    freeShippingThreshold: 1150,
    amountToFreeShipping: 0,
    totalAmount,
  }) as unknown as PostUserOrderPreviewRes;

const previewA = preview([
  [101, 1],
  [102, 2],
]);

const pending: Omit<PendingOrder, "savedAt"> = {
  sourceHref: "/order?cart=12,13",
  bodyKey: toPendingBodyKey(body, previewA),
  orderId: 481,
  orderNumber: "SM-20261104-000481",
  totalAmount: 1160,
};

describe("pendingOrder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("같은 source·bodyKey 면 돌려준다", () => {
    savePendingOrder(pending);

    expect(findPendingOrder(pending.sourceHref, pending.bodyKey)).toMatchObject(
      { orderId: 481, orderNumber: "SM-20261104-000481" },
    );
  });

  it("bodyKey 가 다르면 null", () => {
    savePendingOrder(pending);

    expect(findPendingOrder(pending.sourceHref, "other")).toBeNull();
  });

  it("source 가 다르면 null", () => {
    savePendingOrder(pending);

    expect(findPendingOrder("/order?buy=1:1", pending.bodyKey)).toBeNull();
  });

  it("24시간이 지나면 null 이고 지운다", () => {
    savePendingOrder(pending);
    vi.advanceTimersByTime(PENDING_ORDER_TTL_MS + 1);

    expect(findPendingOrder(pending.sourceHref, pending.bodyKey)).toBeNull();
    expect(sessionStorage.getItem(PENDING_ORDER_KEY)).toBeNull();
  });

  it("손상된 JSON 은 null 이고 지운다", () => {
    sessionStorage.setItem(PENDING_ORDER_KEY, "{nope");

    expect(findPendingOrder(pending.sourceHref, pending.bodyKey)).toBeNull();
    expect(sessionStorage.getItem(PENDING_ORDER_KEY)).toBeNull();
  });

  it("toPendingBodyKey 는 라인 순서와 무관하게 같다", () => {
    const reversed = preview([
      [102, 2],
      [101, 1],
    ]);

    expect(toPendingBodyKey(body, previewA)).toBe(
      toPendingBodyKey(body, reversed),
    );
  });

  it("수량이 바뀌면 bodyKey 가 달라진다", () => {
    const changed = preview(
      [
        [101, 2],
        [102, 2],
      ],
      1260,
    );

    expect(toPendingBodyKey(body, previewA)).not.toBe(
      toPendingBodyKey(body, changed),
    );
  });

  it("합계만 바뀌어도 bodyKey 가 달라진다", () => {
    const repriced = preview(
      [
        [101, 1],
        [102, 2],
      ],
      1200,
    );

    expect(toPendingBodyKey(body, previewA)).not.toBe(
      toPendingBodyKey(body, repriced),
    );
  });

  it("body 가 바뀌면 bodyKey 가 달라진다", () => {
    expect(toPendingBodyKey(body, previewA)).not.toBe(
      toPendingBodyKey({ ...body, paymentMethod: "LINE_PAY" }, previewA),
    );
  });

  it("updatePendingOrder 는 resultToken 만 덧쓴다", () => {
    savePendingOrder(pending);
    updatePendingOrder({ resultToken: "Xy9" });

    expect(findPendingOrder(pending.sourceHref, pending.bodyKey)).toMatchObject(
      { orderId: 481, resultToken: "Xy9" },
    );
  });

  it("clearPendingOrder 는 지운다", () => {
    savePendingOrder(pending);
    clearPendingOrder();

    expect(findPendingOrder(pending.sourceHref, pending.bodyKey)).toBeNull();
  });
});
