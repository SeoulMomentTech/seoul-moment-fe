import type { AdminOrderId } from "@shared/services/order";
import type {
  AdminShipmentCustomsStatus,
  AdminShipmentDetail,
  PatchAdminShipmentRequest,
  PostAdminShipmentRequest,
} from "@shared/services/shipment";
import { toDateTimeInputValue } from "@shared/utils/format";

export interface ShipmentFormOrder {
  orderId: AdminOrderId;
  orderNumber: string;
}

/** 폼 값. 글자칸은 빈 문자열, 날짜칸은 datetime-local 값(이 PC 시간)이다 */
export interface ShipmentFormValues {
  orders: ShipmentFormOrder[];
  intlCarrier: string;
  intlTrackingNo: string;
  houseAirwaybillNo: string;
  importDeclarationNo: string;
  customsStatus: AdminShipmentCustomsStatus;
  declaredAt: string;
  clearedAt: string;
  memo: string;
}

const TEXT_FIELDS = [
  "intlCarrier",
  "intlTrackingNo",
  "houseAirwaybillNo",
  "importDeclarationNo",
  "memo",
] as const;

const DATE_FIELDS = ["declaredAt", "clearedAt"] as const;

export const toShipmentFormValues = (
  shipment?: AdminShipmentDetail,
): ShipmentFormValues => ({
  orders:
    shipment?.orders.map(({ orderId, orderNumber }) => ({
      orderId,
      orderNumber,
    })) ?? [],
  intlCarrier: shipment?.intlCarrier ?? "",
  intlTrackingNo: shipment?.intlTrackingNo ?? "",
  houseAirwaybillNo: shipment?.houseAirwaybillNo ?? "",
  importDeclarationNo: shipment?.importDeclarationNo ?? "",
  customsStatus: shipment?.customsStatus ?? "WAITING",
  declaredAt: toDateTimeInputValue(shipment?.declaredAt),
  clearedAt: toDateTimeInputValue(shipment?.clearedAt),
  memo: shipment?.memo ?? "",
});

const toIso = (value: string) => new Date(value).toISOString();

/** 저장 전에 막을 것. 서버도 같은 이유로 400·409 를 준다 */
export const validateShipmentForm = (values: ShipmentFormValues) => {
  if (values.orders.length === 0) return "실린 주문을 한 건 이상 넣어주세요.";

  const trackingNo = values.intlTrackingNo.trim();
  if (trackingNo && trackingNo === values.importDeclarationNo.trim()) {
    return "국제운송장 번호와 수입신고번호가 같습니다. 칸을 확인해주세요.";
  }

  return null;
};

/** 등록은 아는 것만 보낸다. 빈 칸은 생략한다 */
export const toCreateShipmentPayload = (
  values: ShipmentFormValues,
): PostAdminShipmentRequest => {
  const payload: PostAdminShipmentRequest = {
    orderIds: values.orders.map((order) => order.orderId),
    customsStatus: values.customsStatus,
  };

  for (const field of TEXT_FIELDS) {
    const value = values[field].trim();
    if (value) payload[field] = value;
  }
  for (const field of DATE_FIELDS) {
    if (values[field]) payload[field] = toIso(values[field]);
  }

  return payload;
};

const sameOrderIds = (a: ShipmentFormOrder[], b: ShipmentFormOrder[]) => {
  const ids = new Set(a.map((order) => order.orderId));
  return a.length === b.length && b.every((order) => ids.has(order.orderId));
};

/**
 * 수정은 바뀐 필드만 보낸다. 비운 칸은 null 로 보내 지운다.
 * orderIds 는 실린 주문을 통째로 바꾸므로 목록이 달라졌을 때만 전부 보낸다.
 */
export const toPatchShipmentPayload = (
  initial: ShipmentFormValues,
  values: ShipmentFormValues,
): PatchAdminShipmentRequest => {
  const payload: PatchAdminShipmentRequest = {};

  if (!sameOrderIds(initial.orders, values.orders)) {
    payload.orderIds = values.orders.map((order) => order.orderId);
  }
  if (initial.customsStatus !== values.customsStatus) {
    payload.customsStatus = values.customsStatus;
  }
  for (const field of TEXT_FIELDS) {
    const value = values[field].trim();
    if (value !== initial[field].trim()) payload[field] = value || null;
  }
  for (const field of DATE_FIELDS) {
    if (values[field] !== initial[field]) {
      payload[field] = values[field] ? toIso(values[field]) : null;
    }
  }

  return payload;
};
