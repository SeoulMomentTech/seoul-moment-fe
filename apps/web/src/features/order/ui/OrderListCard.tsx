import { ChevronRightIcon, PackageIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { UserOrderListItem } from "@shared/services/userOrder";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import { formatTaipeiDateTime } from "@entities/payment";

import { OrderCancelRequestedBadge } from "./OrderCancelRequestedBadge";
import { OrderDeliveryProgress } from "./OrderDeliveryProgress";
import { showsCancelRequestedBadge } from "../model/orderCancel";
import { ORDER_STATUS_TONE } from "../model/orderDetail";
import { getExtraItemCount, showsDeliveryProgress } from "../model/orderList";

/** 주문내역 카드 한 장. 누르면 주문 상세로 간다 */
export function OrderListCard({ order }: { order: UserOrderListItem }) {
  const t = useTranslations();
  const extra = getExtraItemCount(order.itemCount);

  return (
    <li>
      <Link
        className="group grid gap-4 border border-black/10 p-5 transition-colors hover:border-black/30 max-sm:p-4"
        href={`/mypage/order/${order.orderId}`}
      >
        <div className="flex items-start gap-4">
          {order.representativeImageUrl ? (
            // 주문 시점 스냅샷 이미지다. 상품 API 로 다시 조회하지 않는다
            <BaseImage
              alt=""
              className="size-20 shrink-0 border border-black/[0.07] object-cover max-sm:size-16"
              height={80}
              src={order.representativeImageUrl}
              unoptimized
              width={80}
            />
          ) : (
            <span className="flex size-20 shrink-0 items-center justify-center bg-black/5 max-sm:size-16">
              <PackageIcon aria-hidden className="size-6 text-black/30" />
            </span>
          )}

          <div className="grid min-w-0 flex-1 gap-1">
            <p className="text-body-2 max-sm:text-body-3 truncate font-semibold">
              {order.representativeProductName ?? order.orderNumber}
              {extra > 0 && (
                <span className="text-neutral font-normal">
                  {" "}
                  {t("order_more_items", { count: extra })}
                </span>
              )}
            </p>
            {order.representativeOptionText && (
              <p className="text-body-4 text-neutral truncate">
                {order.representativeOptionText}
              </p>
            )}
            <p className="text-body-5 text-neutral font-mono tabular-nums">
              {order.orderNumber} · {formatTaipeiDateTime(order.orderedAt)}
            </p>
          </div>

          <div className="grid shrink-0 justify-items-end gap-2">
            {/* 취소 접수는 결제 상태와 따로 간다. 진행바에 섞지 않고 상태 배지 옆에 붙인다 */}
            <div className="flex flex-wrap justify-end gap-1.5">
              {showsCancelRequestedBadge(
                order.status,
                order.cancellationRequested,
              ) && (
                <OrderCancelRequestedBadge className="text-body-5 px-2.5 py-0.5" />
              )}
              <span
                className={`text-body-5 ${cn(
                  "rounded-full px-2.5 py-0.5 font-semibold",
                  ORDER_STATUS_TONE[order.status],
                )}`}
              >
                {order.statusLabel}
              </span>
            </div>
            <p className="text-body-2 max-sm:text-body-3 font-bold tabular-nums">
              {toNTCurrency(order.totalAmount)}
            </p>
          </div>

          <ChevronRightIcon
            aria-hidden
            className="size-5 shrink-0 self-center text-black/30 transition-colors group-hover:text-black max-sm:hidden"
          />
        </div>

        {showsDeliveryProgress(order.status) && (
          <OrderDeliveryProgress
            label={order.deliveryStageLabel}
            step={order.deliveryStep}
          />
        )}
      </Link>
    </li>
  );
}
