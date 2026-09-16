"use client";

import { useState } from "react";

import { ShoppingCartIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import AuthOnly from "@shared/lib/components/AuthOnly";
import { cn } from "@shared/lib/style";
import type { UserOrderPaymentMethod } from "@shared/services/userOrder";
import { Empty } from "@shared/ui/empty";
import FixedBox from "@shared/ui/fixed-box";

import { Link } from "@/i18n/navigation";

import { useGetUserInfoQuery, useGetUserProfileQuery } from "@entities/user";
import {
  OrderAmountRows,
  OrderBar,
  OrderItemList,
  OrderPaymentSection,
  OrderSection,
  OrderShippingSection,
  OrderSummary,
  useOrderItems,
  useOrderShipping,
} from "@features/order";
import { Button, Skeleton } from "@seoul-moment/ui";

function OrderSkeleton() {
  return (
    <div className="grid gap-4 pt-5">
      <Skeleton className="h-7 w-40" />
      {Array.from({ length: 2 }).map((_, index) => (
        <div className="flex gap-3" key={`order-skeleton-${index + 1}`}>
          <Skeleton className="size-20 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 주문할 것이 없을 때. 장바구니를 거치지 않고 들어온 경우도 여기로 온다 */
function OrderEmpty({ description }: { description: string }) {
  const t = useTranslations();

  return (
    <div className="py-18 grid justify-items-center gap-5 max-sm:py-12">
      <Empty
        description={description}
        icon={
          <ShoppingCartIcon
            className="size-10 text-black/20"
            strokeWidth={1.6}
          />
        }
      />
      <Button asChild className="h-11 rounded-[4px] px-6" variant="outline">
        <Link href="/cart">{t("go_to_cart")}</Link>
      </Button>
    </div>
  );
}

export function OrderPage() {
  const t = useTranslations();

  const { data: profile } = useGetUserProfileQuery();
  const { data: userInfo } = useGetUserInfoQuery();

  const shipping = useOrderShipping({ profile, userInfo });

  const [paymentMethod, setPaymentMethod] =
    useState<UserOrderPaymentMethod>("LINE_PAY");

  // 라인도 금액도 미리보기 응답에서 읽는다. 주문 대상은 URL 이 들고 있다.
  const { groups, itemCount, preview, isPending, isError, hasNoSelection } =
    useOrderItems({ city: shipping.city, district: shipping.district });

  // 주소가 없으면 서버가 본섬 기준 예상 배송비를 주지만 주문서는 확정값만 그린다 —
  // 예상값을 그대로 쓰면 주소를 넣기 전인데 확정 금액처럼 읽힌다.
  const productAmount = preview?.totalProductAmount ?? 0;
  const isShippingFixed = preview != null && !preview.isShippingEstimated;

  const amounts = {
    productAmount,
    shippingFee: isShippingFixed ? preview.shippingFee : null,
    regionLabel: isShippingFixed
      ? `${shipping.city} ${shipping.district} · ${t(
          preview.isRemoteIsland ? "remote_island" : "main_island",
        )}`
      : null,
    totalAmount: isShippingFixed ? preview.totalAmount : productAmount,
  };

  return (
    <AuthOnly>
      <div
        className={cn(
          // 헤더가 fixed 라 그보다 큰 상단 패딩이 필요하다 (장바구니·상품상세 관행)
          "pt-26.5 pb-15 mx-auto w-full max-w-7xl px-5",
          "max-sm:pb-30 max-sm:pt-19",
        )}
      >
        <h1
          className={cn(
            "text-title-3 max-sm:text-title-4 mb-5 font-bold tracking-[-0.02em]",
          )}
        >
          {t("order_sheet")}
        </h1>

        {hasNoSelection ? (
          <OrderEmpty description={t("order_no_selection")} />
        ) : isPending ? (
          <OrderSkeleton />
        ) : isError ? (
          <OrderEmpty description={t("please_try_again")} />
        ) : !groups.length ? (
          <OrderEmpty description={t("order_items_unavailable")} />
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_360px] items-start gap-10",
                "max-lg:grid-cols-1 max-lg:gap-8",
              )}
            >
              <div>
                <OrderSection
                  badge={String(itemCount)}
                  title={t("order_items")}
                >
                  <OrderItemList groups={groups} />
                </OrderSection>

                <OrderSection title={t("shipping_address")}>
                  <OrderShippingSection
                    canUseDefault={shipping.canUseDefault}
                    form={shipping.form}
                    onCityChange={shipping.handleCityChange}
                    onDistrictChange={shipping.handleDistrictChange}
                    onUseDefaultChange={shipping.setUseDefaultShipping}
                    useDefaultShipping={shipping.useDefaultShipping}
                  />
                </OrderSection>

                <OrderSection title={t("payment_method")}>
                  <OrderPaymentSection
                    onChange={setPaymentMethod}
                    value={paymentMethod}
                  />
                </OrderSection>

                {/* 모바일에서는 금액 내역이 본문에 온다 — 하단 바만으로는 배송비를 볼 수 없다 */}
                <OrderSection
                  className="hidden max-sm:block"
                  title={t("payment_amount")}
                >
                  <OrderAmountRows {...amounts} />
                </OrderSection>
              </div>

              <OrderSummary
                {...amounts}
                canSubmit={shipping.isValid}
                className="top-19 sticky max-sm:hidden"
              />
            </div>

            <FixedBox
              className="left-0 z-10 hidden max-sm:block"
              direction="bottom"
            >
              <OrderBar
                canSubmit={shipping.isValid}
                totalAmount={amounts.totalAmount}
              />
            </FixedBox>
          </>
        )}
      </div>
    </AuthOnly>
  );
}
