import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INVOICE_DEFAULT_VALUES } from "./invoiceSchema";
import {
  clearOrderDraft,
  ORDER_DRAFT_KEY,
  ORDER_DRAFT_TTL_MS,
  peekOrderDraft,
  saveOrderDraft,
  takeOrderDraft,
  type OrderDraft,
} from "./orderDraft";

const EMPTY_HOME = {
  recipientName: "",
  phone: "",
  postalCode: "",
  city: "",
  district: "",
  detailAddress: "",
  requestMessage: "shipping_request_none",
} as const;

const draft: Omit<OrderDraft, "savedAt"> = {
  sourceHref: "/order?cart=1,2",
  shippingMethod: "CVS",
  home: { useDefaultShipping: true, values: EMPTY_HOME },
  cvs: {
    chain: "UNIMART",
    storeToken: null,
    recipientName: "李佳蓉",
    phone: "0912345678",
  },
  paymentMethod: "LINE_PAY",
};

describe("orderDraft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("저장한 draft 를 같은 sourceHref 로 가져오면 지워진다", () => {
    saveOrderDraft(draft);

    expect(takeOrderDraft("/order?cart=1,2")).toMatchObject(draft);
    expect(peekOrderDraft()).toBeNull();
  });

  it("다른 sourceHref 면 돌려주지 않고 남겨 둔다", () => {
    saveOrderDraft(draft);

    expect(takeOrderDraft("/order?buy=101:1")).toBeNull();
    expect(peekOrderDraft()).not.toBeNull();
  });

  it("1시간이 지나면 버린다", () => {
    saveOrderDraft(draft);
    vi.advanceTimersByTime(ORDER_DRAFT_TTL_MS + 1);

    expect(peekOrderDraft()).toBeNull();
    expect(sessionStorage.getItem(ORDER_DRAFT_KEY)).toBeNull();
  });

  it("손상된 JSON 은 지우고 null 이다", () => {
    sessionStorage.setItem(ORDER_DRAFT_KEY, "{not json");

    expect(peekOrderDraft()).toBeNull();
    expect(sessionStorage.getItem(ORDER_DRAFT_KEY)).toBeNull();
  });

  it("저장이 실패해도 throw 하지 않는다", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });

    expect(() => saveOrderDraft(draft)).not.toThrow();
  });

  it("invoice 를 저장하고 그대로 돌려준다", () => {
    const invoice = {
      ...INVOICE_DEFAULT_VALUES,
      type: "DONATION" as const,
      loveCode: "168001",
    };

    saveOrderDraft({ ...draft, invoice });

    expect(takeOrderDraft(draft.sourceHref)?.invoice).toEqual(invoice);
  });

  it("invoice 가 없는 옛 draft 도 읽힌다", () => {
    sessionStorage.setItem(
      ORDER_DRAFT_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() }),
    );

    const restored = peekOrderDraft();

    expect(restored?.cvs.chain).toBe("UNIMART");
    expect(restored?.invoice).toBeUndefined();
  });

  it("clearOrderDraft 는 저장된 draft 를 지운다", () => {
    saveOrderDraft(draft);
    clearOrderDraft();

    expect(peekOrderDraft()).toBeNull();
  });
});
