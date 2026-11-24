import type { ReactNode } from "react";

import { Copy, X } from "lucide-react";


import useCopyToClipBoard from "@shared/hooks/useCopyToClipBoard";
import type {
  AdminOrderId,
  AdminOrderListItem,
  GetAdminOrderDetailResponse,
} from "@shared/services/order";
import { EMPTY_VALUE, formatCurrency } from "@shared/utils/format";
import { toast } from "sonner";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@seoul-moment/ui";

import { PAYMENT_METHOD_LABEL, TIMER_BADGE_CLASS } from "../constants";
import { useAdminOrderDetailQuery } from "../hooks";
import { OrderTimerBadge } from "./OrderTimerBadge";
import { canStartEarlyPurchase } from "../lib/purchase";
import { formatTaipeiDateTime } from "../lib/taipeiDate";

/** 응답에 데이터가 아직 없는 탭. 다음 스코프(통관·물류, 취소·환불, 이력)에서 연다 */
const UPCOMING_TABS = ["통관·배송", "취소·환불", "작업 이력"] as const;

interface OrderDrawerProps {
  orderId: AdminOrderId | null;
  now: number;
  onClose(): void;
  onStartPurchase(timer: AdminOrderListItem): void;
}

/**
 * 주문 상세 드로어. 표는 그대로 두고 오른쪽에서 열려 검색·페이지·스크롤이 유지된다.
 */
export function OrderDrawer({
  orderId,
  now,
  onClose,
  onStartPurchase,
}: OrderDrawerProps) {
  const { data, dataUpdatedAt, isLoading } = useAdminOrderDetailQuery(orderId);
  const detail = data?.data;

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => !open && onClose()}
      open={orderId !== null}
    >
      <DrawerContent className="w-full overflow-y-auto overflow-x-hidden rounded-none bg-white data-[vaul-drawer-direction=right]:sm:max-w-xl">
        {isLoading || !detail ? (
          <DrawerSkeleton />
        ) : (
          <DrawerBody
            detail={detail}
            now={now}
            onClose={onClose}
            onStartPurchase={onStartPurchase}
            receivedAt={dataUpdatedAt}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function DrawerSkeleton() {
  return (
    <div className="grid gap-4 p-6">
      <DrawerTitle className="sr-only">주문 상세 불러오는 중</DrawerTitle>
      <Skeleton className="h-6 w-56" rounded />
      <Skeleton className="h-20 w-full" rounded />
      <Skeleton className="h-40 w-full" rounded />
    </div>
  );
}

function DrawerBody({
  detail,
  receivedAt,
  now,
  onClose,
  onStartPurchase,
}: {
  detail: GetAdminOrderDetailResponse;
  receivedAt: number;
  now: number;
  onClose(): void;
  onStartPurchase(timer: AdminOrderListItem): void;
}) {
  const { order, purchase, timer } = detail;
  const { copy } = useCopyToClipBoard();

  const handleCopy = async () => {
    if (await copy(order.orderNumber)) {
      toast.success("주문번호를 복사했습니다.");
    }
  };

  const canEarly = !timer.canStartPurchase && canStartEarlyPurchase(timer);

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-4">
        <DrawerTitle className="text-lg font-semibold text-gray-900">
          {order.orderNumber}
        </DrawerTitle>
        <button
          aria-label="주문번호 복사"
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          onClick={handleCopy}
          type="button"
        >
          <Copy className="size-4" />
        </button>
        <DrawerDescription className="sr-only">
          주문 상세와 한국 발주
        </DrawerDescription>
        <button
          aria-label="닫기"
          className="ml-auto rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="grid gap-5 p-6">
        <section
          className={cn(
            "rounded-lg px-4 py-3",
            TIMER_BADGE_CLASS[timer.timerState],
          )}
        >
          <OrderTimerBadge now={now} receivedAt={receivedAt} timer={timer} />
          <p className="mt-1 text-sm font-medium">{timer.timerStateLabel}</p>
          <p className="mt-0.5 text-xs opacity-80">
            발주 가능 시각 {formatTaipeiDateTime(timer.readyAt)} (Asia/Taipei)
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {canEarly ? (
            <Button onClick={() => onStartPurchase(timer)} variant="outline">
              조기 발주 (사유 입력)
            </Button>
          ) : (
            <Button
              disabled={!timer.canStartPurchase}
              onClick={() => onStartPurchase(timer)}
            >
              {purchase.purchaseStatus === "ORDERED"
                ? "발주 완료"
                : "한국 발주 시작"}
            </Button>
          )}
          <Button disabled title="다음 스코프에서 열립니다" variant="outline">
            취소/환불 관리
          </Button>
        </div>

        <Tabs defaultValue="order">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="order">주문 정보</TabsTrigger>
            <TabsTrigger value="purchase">발주·매입</TabsTrigger>
            {UPCOMING_TABS.map((label) => (
              <TabsTrigger disabled key={label} value={label}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent className="grid gap-5 pt-3" value="order">
            <Section title="상품">
              <ul className="grid gap-3">
                {order.items.map((item) => (
                  <li className="flex gap-3" key={item.orderItemId}>
                    <img
                      alt=""
                      className="size-14 shrink-0 rounded border border-gray-100 object-cover"
                      src={item.imageUrl}
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-xs text-gray-500">{item.brandName}</p>
                      <p className="truncate font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.optionText} · {item.quantity}개
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="가격 내역">
              <dl className="grid gap-1.5 text-sm">
                <Row label="상품 합계">
                  {formatCurrency(order.totalProductAmount)}
                </Row>
                {/* 주문 시점 스냅샷이다. 0 이면 줄을 숨긴다 */}
                {order.internationalDiscount > 0 && (
                  <Row label="국제배송비 지원 할인">
                    <span className="text-green-700">
                      −{formatCurrency(order.internationalDiscount)}
                    </span>
                  </Row>
                )}
                <Row label="배송비">
                  {formatCurrency(order.shippingFee)}
                  {order.isRemoteIsland && (
                    <span className="ml-1 text-xs text-gray-500">(외곽 섬)</span>
                  )}
                </Row>
                <div className="mt-1 border-t border-gray-200 pt-2">
                  <Row label="최종 결제액" strong>
                    {formatCurrency(order.totalAmount)}
                  </Row>
                </div>
              </dl>
            </Section>

            <Section title="배송지">
              <dl className="grid gap-1.5 text-sm">
                <Row label="받는 분">{order.shipping.recipientName}</Row>
                <Row label="연락처">{order.shipping.phone}</Row>
                {order.shipping.shippingType === "CVS" &&
                order.shipping.cvsStore ? (
                  <Row label="편의점 픽업">
                    {order.shipping.cvsStore.storeName}
                    <p className="text-xs text-gray-500">
                      {order.shipping.cvsStore.storeAddress}
                    </p>
                  </Row>
                ) : (
                  <Row label="주소">
                    {[
                      order.shipping.postalCode,
                      order.shipping.city,
                      order.shipping.district,
                      order.shipping.detailAddress,
                    ]
                      .filter(Boolean)
                      .join(" ") || EMPTY_VALUE}
                  </Row>
                )}
                {order.shipping.requestMessage && (
                  <Row label="요청사항">{order.shipping.requestMessage}</Row>
                )}
              </dl>
            </Section>

            <Section title="결제 · 발표">
              <dl className="grid gap-1.5 text-sm">
                <Row label="결제 수단">
                  {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                  {order.payment?.pgPaymentType && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({order.payment.pgPaymentType})
                    </span>
                  )}
                </Row>
                <Row label="주문 상태">{order.statusLabel}</Row>
                <Row label="결제일시">
                  {formatTaipeiDateTime(order.paidAt)}
                </Row>
                <Row label="배송 단계">
                  {order.deliveryStageLabel} · {order.deliveryStep}/6
                </Row>
                <Row label="발표번호">
                  {order.invoice?.invoiceNo ?? EMPTY_VALUE}
                </Row>
              </dl>
            </Section>
          </TabsContent>

          <TabsContent className="pt-3" value="purchase">
            <Section title="발주 확인">
              <dl className="grid gap-1.5 text-sm">
                <Row label="발주 상태">
                  {purchase.purchaseStatus === "ORDERED" ? "발주 완료" : "미발주"}
                </Row>
                <Row label="발주 시각">
                  {formatTaipeiDateTime(purchase.supplierOrderedAt)}
                </Row>
                <Row label="공급처 발주번호">
                  {purchase.supplierOrderNo ?? EMPTY_VALUE}
                </Row>
                <Row label="조기 발주 사유">
                  {purchase.purchaseOverrideReason ?? EMPTY_VALUE}
                </Row>
                <Row label="처리 관리자 ID">
                  {purchase.purchasedByAdminId ?? EMPTY_VALUE}
                </Row>
              </dl>
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium text-gray-500">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd
        className={cn(
          "text-right tabular-nums text-gray-900",
          strong && "font-semibold",
        )}
      >
        {children}
      </dd>
    </div>
  );
}
