"use client";

import { SearchXIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type {
  GetUserOrderDetailRes,
  UserOrderInvoiceInfo,
  UserOrderInvoiceType,
  UserOrderStatus,
} from "@shared/services/userOrder";
import {
  StatusCard,
  StatusInfo,
  StatusNotice,
  type StatusInfoRow,
} from "@shared/ui/status-card";

import { Link } from "@/i18n/navigation";

import { useUserOrderDetailQuery } from "@entities/order";
import { formatTaipeiDateTime, PaymentDepositInfo } from "@entities/payment";
import { Button, Skeleton } from "@seoul-moment/ui";

import { OrderAmountRows } from "./OrderAmountRows";
import { OrderItemList } from "./OrderItemList";
import { OrderSection } from "./OrderSection";
import {
  canRepay,
  ORDER_STATUS_KEY,
  toCvsStoreLabel,
  toOrderItemGroups,
} from "../model/orderDetail";
import { useOrderRepay } from "../model/useOrderRepay";

/** 다시 결제를 새 탭·외부로 연 뒤 주문을 다시 묻는 간격 */
const ORDER_POLL_MS = 4000;

const STATUS_TONE: Record<UserOrderStatus, string> = {
  PENDING: "bg-brand/10 text-[#b5541a]",
  PAYMENT_WAITING: "bg-brand/10 text-[#b5541a]",
  PAID: "bg-[#e6f2ec] text-[#2f7d5d]",
  CANCELED: "bg-black/5 text-black/50",
  FAILED: "bg-danger/10 text-danger",
};

const INVOICE_TYPE_KEY: Record<UserOrderInvoiceType, string> = {
  MEMBER_CARRIER: "invoice_type_member_carrier",
  MOBILE_BARCODE: "invoice_type_mobile_barcode",
  CITIZEN_CERT: "invoice_type_citizen_cert",
  DONATION: "invoice_type_donation",
  COMPANY: "invoice_type_company",
};

const METHOD_LABEL: Record<string, string> = {
  ECPAY: "ECPay",
  LINE_PAY: "LINE Pay",
};

type Translate = ReturnType<typeof useTranslations>;

interface OrderDetailProps {
  orderId: number;
}

/**
 * 주문 상세. 주문 시점 스냅샷(`GET user/order/{id}`) 하나로 상품·배송·결제·전자발표·금액을 그린다.
 * 결제 전 주문은 여기서 결제 시작만 다시 부를 수 있다(새 주문을 만들지 않는다).
 */
export function OrderDetail({ orderId }: OrderDetailProps) {
  const t = useTranslations();

  const query = useUserOrderDetailQuery(orderId);
  const { repay, isRepaying, isAwaiting } = useOrderRepay({
    orderId,
    onChanged: () => void query.refetch(),
  });
  // 결제창을 다른 곳(새 탭·외부)에 연 뒤에는 결제 전인 동안만 다시 묻는다
  const polling = useUserOrderDetailQuery(orderId, {
    enabled: isAwaiting && query.data?.status === "PENDING",
    refetchInterval: ORDER_POLL_MS,
  });
  const order = polling.data ?? query.data;

  if (query.isError && !order) {
    return (
      <StatusCard
        actions={
          <Button asChild>
            <Link href="/">{t("payment_continue_shopping")}</Link>
          </Button>
        }
        icon={<SearchXIcon aria-hidden className="size-7" />}
        title={t("order_detail_not_found")}
        tone="muted"
      />
    );
  }

  if (!order) return <OrderDetailSkeleton />;

  return (
    <div className="grid gap-2">
      <header className="flex flex-wrap items-end justify-between gap-3 pb-4">
        <div className="grid gap-1">
          <p className="text-body-4 text-neutral">{t("order_detail_title")}</p>
          <h1 className="text-title-4 font-mono font-bold tracking-[-0.01em]">
            {order.orderNumber}
          </h1>
          <p className="text-body-4 text-neutral">
            {t("order_ordered_at")}{" "}
            <span className="tabular-nums text-black/80">
              {formatTaipeiDateTime(order.orderedAt)}
            </span>
          </p>
        </div>
        <span
          className={`text-body-4 ${cn(
            "rounded-full px-3 py-1 font-semibold",
            STATUS_TONE[order.status],
          )}`}
        >
          {t(ORDER_STATUS_KEY[order.status])}
        </span>
      </header>

      {canRepay(order.status) && (
        <div className="mb-4 flex flex-wrap items-center gap-3 max-sm:grid">
          <div className="flex-1">
            <StatusNotice tone="warn">
              {t(isAwaiting ? "payment_external_hint" : "order_repay_notice")}
            </StatusNotice>
          </div>
          <Button
            className="h-11 rounded-[4px] px-6"
            disabled={isRepaying}
            onClick={() => void repay()}
            type="button"
          >
            {t(isRepaying ? "payment_processing" : "payment_retry")}
          </Button>
        </div>
      )}

      <OrderSection badge={String(order.items.length)} title={t("order_items")}>
        <OrderItemList groups={toOrderItemGroups(order.items)} />
      </OrderSection>

      <div className={cn("grid grid-cols-2 gap-x-10", "max-lg:grid-cols-1")}>
        <OrderSection title={t("shipping_address")}>
          <StatusInfo rows={toShippingRows(order, t)} />
        </OrderSection>

        <OrderSection title={t("order_detail_payment")}>
          <div className="grid gap-3">
            <StatusInfo rows={toPaymentRows(order, t)} />
            {order.payment?.status === "WAITING_DEPOSIT" && (
              <PaymentDepositInfo payment={order.payment} />
            )}
          </div>
        </OrderSection>
      </div>

      {order.invoice && (
        <OrderSection title={t("invoice_section_title")}>
          <StatusInfo rows={toInvoiceRows(order.invoice, t)} />
        </OrderSection>
      )}

      <OrderSection title={t("payment_amount")}>
        <OrderAmountRows
          productAmount={order.totalProductAmount}
          regionLabel={toRegionLabel(order, t)}
          shippingFee={order.shippingFee}
          totalAmount={order.totalAmount}
        />
      </OrderSection>
    </div>
  );
}

function toShippingRows(
  order: GetUserOrderDetailRes,
  t: Translate,
): StatusInfoRow[] {
  const { shipping } = order;

  const place =
    shipping.shippingType === "CVS"
      ? [
          {
            label: t("shipping_method_cvs"),
            value: (
              <span className="grid gap-0.5">
                <span>{toCvsStoreLabel(shipping.cvsStore)}</span>
                <span className="font-normal text-black/60">
                  {shipping.cvsStore.storeAddress}
                </span>
              </span>
            ),
          },
        ]
      : [
          {
            label: t("shipping_method_home"),
            value: [
              shipping.postalCode,
              shipping.city,
              shipping.district,
              shipping.detailAddress,
            ]
              .filter(Boolean)
              .join(" "),
          },
        ];

  return [
    { label: t("recipient_name"), value: shipping.recipientName },
    { label: t("recipient_phone"), value: shipping.phone },
    ...place,
  ];
}

function toPaymentRows(
  order: GetUserOrderDetailRes,
  t: Translate,
): StatusInfoRow[] {
  const method = order.payment?.method ?? order.paymentMethod;
  const paidAt = order.paidAt ?? order.payment?.paidAt;

  return [
    ...(method
      ? [
          {
            label: t("payment_method_label"),
            value: METHOD_LABEL[method] ?? method,
          },
        ]
      : []),
    ...(paidAt
      ? [{ label: t("payment_paid_at"), value: formatTaipeiDateTime(paidAt) }]
      : []),
    {
      label: t("payment_amount"),
      value: toNTCurrency(order.totalAmount),
      total: true,
    },
  ];
}

function toInvoiceRows(
  invoice: UserOrderInvoiceInfo,
  t: Translate,
): StatusInfoRow[] {
  const value =
    invoice.type === "DONATION"
      ? invoice.loveCode
      : invoice.type === "COMPANY"
        ? [invoice.companyTaxId, invoice.companyName]
            .filter(Boolean)
            .join(" · ")
        : invoice.carrierNum;

  return [
    {
      label: t(INVOICE_TYPE_KEY[invoice.type]),
      value: value ?? "",
    },
    {
      label: t("invoice_no"),
      value:
        invoice.status === "ISSUED" && invoice.invoiceNo ? (
          <span className="font-mono">{invoice.invoiceNo}</span>
        ) : (
          <span className="font-normal text-black/50">
            {t("invoice_issuing")}
          </span>
        ),
    },
  ];
}

function toRegionLabel(order: GetUserOrderDetailRes, t: Translate): string {
  const { shipping } = order;
  const where =
    shipping.shippingType === "CVS"
      ? toCvsStoreLabel(shipping.cvsStore)
      : `${shipping.city} ${shipping.district}`;

  return `${where} · ${t(order.isRemoteIsland ? "remote_island" : "main_island")}`;
}

function OrderDetailSkeleton() {
  return (
    <div className="grid gap-4" data-testid="order-detail-skeleton">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
