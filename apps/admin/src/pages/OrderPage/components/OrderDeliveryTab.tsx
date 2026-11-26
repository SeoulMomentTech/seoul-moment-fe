import { useState, type FormEvent } from "react";

import type {
  AdminOrderDeliveryStage,
  GetAdminOrderDetailResponse,
} from "@shared/services/order";
import { EMPTY_VALUE } from "@shared/utils/format";
import { toast } from "sonner";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import {
  CUSTOMS_STATUS_LABEL,
  DELIVERY_STAGES,
  LOCAL_DELIVERY_FIELD_MAX,
} from "../constants";
import {
  useAdminOrderDeliveryStageMutation,
  useAdminOrderLocalDeliveryMutation,
} from "../hooks";
import { Hint, Row, Section, StatusBadge } from "./OrderDetailParts";
import { getOrderActionErrorMessage } from "../lib/actionError";
import { formatTaipeiDateTime } from "../lib/taipeiDate";

interface OrderDeliveryTabProps {
  detail: GetAdminOrderDetailResponse;
}

/**
 * 통관·배송 탭. 배송 단계와 통관 상태는 서로를 바꾸지 않는다 — 대만 도착으로 바꿔도 통관
 * 완료가 아니고, 묶음의 통관을 완료로 바꿔도 단계는 그대로다.
 */
export function OrderDeliveryTab({ detail }: OrderDeliveryTabProps) {
  const { delivery } = detail;

  return (
    <div className="grid gap-5">
      {/* 저장 뒤 상세가 다시 오면 입력칸을 새 값으로 맞춘다 */}
      <DeliveryStageForm
        detail={detail}
        key={`${delivery.deliveryStage}-${delivery.deliveredAt}`}
      />
      <LocalDeliveryForm
        detail={detail}
        key={`${delivery.localCarrier}-${delivery.localTrackingNo}`}
      />

      <Section title="국제배송 묶음">
        {delivery.shipments.length === 0 ? (
          <Hint>
            아직 실린 묶음이 없습니다. 국제운송장·수입신고번호는 주문이 아니라
            통관·물류 묶음에 등록합니다.
          </Hint>
        ) : (
          <ul className="grid gap-2">
            {delivery.shipments.map((shipment) => (
              <li
                className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                key={shipment.shipmentId}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    묶음 #{shipment.shipmentId}
                  </span>
                  <StatusBadge className="bg-gray-100 text-gray-700">
                    통관 {CUSTOMS_STATUS_LABEL[shipment.customsStatus]}
                  </StatusBadge>
                </div>
                <dl className="mt-1.5 grid gap-1 text-xs">
                  <Row label="국제운송">
                    {[shipment.intlCarrier, shipment.intlTrackingNo]
                      .filter(Boolean)
                      .join(" · ") || EMPTY_VALUE}
                  </Row>
                  <Row label="수입신고번호">
                    {shipment.importDeclarationNo ?? EMPTY_VALUE}
                  </Row>
                  {shipment.clearedAt && (
                    <Row label="통관 완료">
                      {formatTaipeiDateTime(shipment.clearedAt)}
                    </Row>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/** datetime-local 값(이 PC 시간)을 ISO 로. 비우면 서버가 지금으로 적는다 */
const toIsoOrUndefined = (value: string) =>
  value ? new Date(value).toISOString() : undefined;

function DeliveryStageForm({ detail }: OrderDeliveryTabProps) {
  const { delivery, order } = detail;
  const [stage, setStage] = useState<AdminOrderDeliveryStage>(
    delivery.deliveryStage,
  );
  const [deliveredAt, setDeliveredAt] = useState("");
  const { mutate, isPending } = useAdminOrderDeliveryStageMutation();

  const isDelivered = stage === "DELIVERED";
  const isChanged =
    stage !== delivery.deliveryStage || (isDelivered && deliveredAt !== "");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isChanged || isPending) return;

    mutate(
      {
        orderIds: [order.orderId],
        deliveryStage: stage,
        deliveredAt: isDelivered ? toIsoOrUndefined(deliveredAt) : undefined,
      },
      {
        onSuccess: () => toast.success("배송 단계를 바꿨습니다."),
        onError: (error) =>
          toast.error(
            getOrderActionErrorMessage(
              error,
              "배송 단계를 바꾸지 못했습니다.",
              {
                400: "수령 시각은 미래일 수 없습니다.",
                409: "결제 완료 주문만 배송 단계를 바꿀 수 있습니다.",
              },
            ),
          ),
      },
    );
  };

  return (
    <Section title="배송 단계">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <dl className="grid gap-1.5 text-sm">
          <Row label="현재">
            {delivery.deliveryStageLabel} · {delivery.deliveryStep}/6
          </Row>
          {delivery.deliveredAt && (
            <Row label="수령 시각">
              {formatTaipeiDateTime(delivery.deliveredAt)}
            </Row>
          )}
        </dl>

        <div className="flex gap-2">
          <Select
            onValueChange={(value) =>
              setStage(value as AdminOrderDeliveryStage)
            }
            value={stage}
          >
            <SelectTrigger aria-label="바꿀 배송 단계" className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="**:cursor-pointer bg-white">
              {DELIVERY_STAGES.map((option, index) => (
                <SelectItem key={option.value} value={option.value}>
                  {index + 1}. {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!isChanged || isPending} type="submit">
            {isPending ? "변경 중…" : "변경"}
          </Button>
        </div>

        {isDelivered && (
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-600" htmlFor="delivered-at">
              실제 수령 시각 (이 PC 시간 기준 · 비우면 지금)
            </Label>
            <Input
              id="delivered-at"
              onChange={(event) => setDeliveredAt(event.target.value)}
              type="datetime-local"
              value={deliveredAt}
            />
          </div>
        )}

        <Hint>
          앞·뒤 어느 단계로든 바꿀 수 있고 작업 이력에 남습니다. 통관 상태는
          바뀌지 않습니다.
        </Hint>
      </form>
    </Section>
  );
}

function LocalDeliveryForm({ detail }: OrderDeliveryTabProps) {
  const { delivery, order } = detail;
  const initialCarrier = delivery.localCarrier ?? "";
  const initialTrackingNo = delivery.localTrackingNo ?? "";
  const [carrier, setCarrier] = useState(initialCarrier);
  const [trackingNo, setTrackingNo] = useState(initialTrackingNo);
  const { mutate, isPending } = useAdminOrderLocalDeliveryMutation();

  const carrierChanged = carrier.trim() !== initialCarrier;
  const trackingNoChanged = trackingNo.trim() !== initialTrackingNo;
  const isChanged = carrierChanged || trackingNoChanged;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isChanged || isPending) return;

    // 보낸 필드만 고친다. 빈 문자열이면 서버가 지운다
    mutate(
      {
        orderId: order.orderId,
        payload: {
          localCarrier: carrierChanged ? carrier.trim() : undefined,
          localTrackingNo: trackingNoChanged ? trackingNo.trim() : undefined,
        },
      },
      {
        onSuccess: () => toast.success("대만 운송장을 저장했습니다."),
        onError: (error) =>
          toast.error(
            getOrderActionErrorMessage(
              error,
              "대만 운송장을 저장하지 못했습니다.",
              { 409: "결제 완료 주문만 운송장을 입력할 수 있습니다." },
            ),
          ),
      },
    );
  };

  return (
    <Section title="대만 국내 운송">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-600" htmlFor="local-carrier">
              운송사
            </Label>
            <Input
              autoComplete="off"
              id="local-carrier"
              maxLength={LOCAL_DELIVERY_FIELD_MAX}
              onChange={(event) => setCarrier(event.target.value)}
              placeholder="7-ELEVEN"
              value={carrier}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-600" htmlFor="local-tracking">
              운송장 번호
            </Label>
            <Input
              autoComplete="off"
              id="local-tracking"
              maxLength={LOCAL_DELIVERY_FIELD_MAX}
              onChange={(event) => setTrackingNo(event.target.value)}
              placeholder="D1234567890"
              value={trackingNo}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Hint>비우고 저장하면 지워집니다. 배송 단계는 바뀌지 않습니다.</Hint>
          <Button
            disabled={!isChanged || isPending}
            type="submit"
            variant="outline"
          >
            {isPending ? "저장 중…" : "저장"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
