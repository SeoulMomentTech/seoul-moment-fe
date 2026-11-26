import type { AdminOrderId } from "@shared/services/order";
import { describe, expect, it } from "vitest";

import {
  toCreateShipmentPayload,
  toPatchShipmentPayload,
  toShipmentFormValues,
  validateShipmentForm,
  type ShipmentFormValues,
} from "./shipmentForm";

const order = (orderId: number) => ({
  orderId: orderId as AdminOrderId,
  orderNumber: `SM-20261123-000${orderId}`,
});

const values = (
  overrides: Partial<ShipmentFormValues> = {},
): ShipmentFormValues => ({
  ...toShipmentFormValues(),
  orders: [order(481)],
  ...overrides,
});

describe("validateShipmentForm", () => {
  it("실린 주문이 없으면 막는다", () => {
    expect(validateShipmentForm(values({ orders: [] }))).not.toBeNull();
  });

  it("국제운송장 번호와 수입신고번호가 같으면 막는다", () => {
    expect(
      validateShipmentForm(
        values({ intlTrackingNo: "AA1", importDeclarationNo: " AA1 " }),
      ),
    ).not.toBeNull();
  });

  it("둘 다 비었으면 같은 값으로 보지 않는다", () => {
    expect(validateShipmentForm(values())).toBeNull();
  });
});

describe("toCreateShipmentPayload", () => {
  it("빈 칸은 보내지 않는다", () => {
    expect(
      toCreateShipmentPayload(
        values({ orders: [order(481), order(482)], intlCarrier: " EMS " }),
      ),
    ).toEqual({
      orderIds: [481, 482],
      customsStatus: "WAITING",
      intlCarrier: "EMS",
    });
  });
});

describe("toPatchShipmentPayload", () => {
  const initial = values({
    orders: [order(481), order(482)],
    intlTrackingNo: "EG123456789KR",
    memo: "첫 묶음",
    declaredAt: "2026-11-25T12:00",
  });

  it("바뀐 것이 없으면 빈 객체다", () => {
    expect(toPatchShipmentPayload(initial, { ...initial })).toEqual({});
  });

  it("비운 글자칸·날짜칸은 null 로 지운다", () => {
    expect(
      toPatchShipmentPayload(initial, { ...initial, memo: "", declaredAt: "" }),
    ).toEqual({ memo: null, declaredAt: null });
  });

  it("주문 순서만 바뀌면 orderIds 를 보내지 않는다", () => {
    expect(
      toPatchShipmentPayload(initial, {
        ...initial,
        orders: [order(482), order(481)],
      }),
    ).toEqual({});
  });

  it("주문을 하나 더하면 기존 주문까지 통째로 보낸다", () => {
    expect(
      toPatchShipmentPayload(initial, {
        ...initial,
        orders: [...initial.orders, order(490)],
      }),
    ).toEqual({ orderIds: [481, 482, 490] });
  });

  it("통관 상태만 바꿀 수 있다", () => {
    expect(
      toPatchShipmentPayload(initial, { ...initial, customsStatus: "CLEARED" }),
    ).toEqual({ customsStatus: "CLEARED" });
  });
});
