"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { toNTCurrency } from "@shared/lib/utils";
import type { GetUserOrderDetailRes } from "@shared/services/userOrder";
import {
  StatusInfo,
  StatusNotice,
  type StatusInfoRow,
} from "@shared/ui/status-card";

import { formatTaipeiDateTime } from "@entities/payment";
import { Button } from "@seoul-moment/ui";

import { OrderCancelRequestDialog } from "./OrderCancelRequestDialog";
import { OrderSection } from "./OrderSection";
import {
  getCancelNotice,
  isPartialRefund,
  REFUND_STATUS_KEY,
  showsCancelSection,
  type CancelNotice,
} from "../model/orderCancel";

type Translate = ReturnType<typeof useTranslations>;

const NOTICE_KEY: Record<Exclude<CancelNotice, null>, string> = {
  delayed: "order_refund_delayed_notice",
  card: "order_refund_card_notice",
  received: "order_cancel_received_notice",
};

interface OrderCancelSectionProps {
  order: GetUserOrderDetailRes;
}

/**
 * 주문 상세의 취소·환불. 신청했거나 환불이 있으면 그 상태를, 신청할 수 있으면 신청 버튼을 보인다.
 * 버튼은 서버의 canRequestCancel 만 따른다 — 간편취소 구간이 지나도 숨기지 않고 안내만 바꾼다.
 */
export function OrderCancelSection({ order }: OrderCancelSectionProps) {
  const t = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const notice = getCancelNotice(order);
  const quickCancelUntil = order.isQuickCancelPeriod
    ? (order.quickCancelUntil ?? null)
    : null;

  if (!showsCancelSection(order) && !order.canRequestCancel) return null;

  return (
    <OrderSection title={t("order_cancel_section")}>
      <div className="grid gap-3">
        {showsCancelSection(order) && (
          <StatusInfo rows={toCancelRows(order, t)} />
        )}
        {notice && (
          <StatusNotice tone={notice === "delayed" ? "danger" : "neutral"}>
            {t(NOTICE_KEY[notice])}
          </StatusNotice>
        )}

        {order.canRequestCancel && (
          <div className="flex flex-wrap items-center gap-3 max-sm:grid">
            <div className="flex-1">
              <StatusNotice>
                {quickCancelUntil
                  ? t("order_cancel_quick_hint", {
                      time: formatTaipeiDateTime(quickCancelUntil),
                    })
                  : t("order_cancel_hint")}
              </StatusNotice>
            </div>
            <Button
              className="h-11 rounded-[4px] border-black/20 px-6 font-semibold text-black"
              onClick={() => setIsDialogOpen(true)}
              type="button"
              variant="outline"
            >
              {t("order_cancel_request")}
            </Button>
          </div>
        )}
      </div>

      {order.canRequestCancel && (
        <OrderCancelRequestDialog
          onOpenChange={setIsDialogOpen}
          open={isDialogOpen}
          orderId={order.orderId}
          quickCancelUntil={quickCancelUntil}
        />
      )}
    </OrderSection>
  );
}

function toCancelRows(
  order: GetUserOrderDetailRes,
  t: Translate,
): StatusInfoRow[] {
  const { refund } = order;

  return [
    ...(order.cancellationRequestedAt
      ? [
          {
            label: t("order_cancel_requested_at"),
            value: formatTaipeiDateTime(order.cancellationRequestedAt),
          },
        ]
      : []),
    ...(refund
      ? [
          {
            label: t("order_refund_status"),
            value: isPartialRefund(order)
              ? `${t(REFUND_STATUS_KEY[refund.status])} · ${t("order_refund_partial")}`
              : t(REFUND_STATUS_KEY[refund.status]),
          },
          {
            label: t("order_refund_amount"),
            value: toNTCurrency(refund.amount),
          },
          ...(refund.completedAt
            ? [
                {
                  label: t("order_refund_completed_at"),
                  value: formatTaipeiDateTime(refund.completedAt),
                },
              ]
            : []),
        ]
      : []),
    // 부분 환불이 여러 번이면 마지막 환불 금액과 합계가 다르다
    ...(order.refundedAmount > 0 &&
    order.refundedAmount !==
      (refund?.status === "COMPLETED" ? refund.amount : 0)
      ? [
          {
            label: t("order_refund_total"),
            value: toNTCurrency(order.refundedAmount),
            total: true,
          },
        ]
      : []),
  ];
}
