import type { AdminShipmentCustomsStatus } from "@shared/services/shipment";

/** 통관 상태. 배송 단계와 따로다 — 통관을 완료로 바꿔도 주문의 배송 단계는 그대로다 */
export const CUSTOMS_STATUSES: {
  value: AdminShipmentCustomsStatus;
  label: string;
}[] = [
  { value: "WAITING", label: "대기" },
  { value: "IN_PROGRESS", label: "진행" },
  { value: "HELD", label: "보류" },
  { value: "CLEARED", label: "완료" },
];

export const CUSTOMS_STATUS_LABEL = Object.fromEntries(
  CUSTOMS_STATUSES.map((status) => [status.value, status.label]),
) as Record<AdminShipmentCustomsStatus, string>;

export const CUSTOMS_STATUS_BADGE_CLASS: Record<
  AdminShipmentCustomsStatus,
  string
> = {
  WAITING: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  HELD: "bg-orange-100 text-orange-700",
  CLEARED: "bg-green-100 text-green-700",
};
