"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { UserOrderListStatusFilter } from "@shared/services/userOrder";

import { OrderListContent } from "./OrderListContent";
import { OrderListFilters } from "./OrderListFilters";
import { DEFAULT_ORDER_LIST_PERIOD } from "../model/orderList";

/** 마이페이지 주문내역. 상태 탭·기간을 바꾸면 같은 목록 API 를 다시 부른다 */
export function OrderList() {
  const t = useTranslations();
  const [status, setStatus] = useState<UserOrderListStatusFilter>("ALL");
  const [months, setMonths] = useState<number | null>(
    DEFAULT_ORDER_LIST_PERIOD,
  );

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        {t("order_history")}
      </h2>

      <OrderListFilters
        months={months}
        onMonthsChange={setMonths}
        onStatusChange={setStatus}
        status={status}
      />

      <OrderListContent months={months} status={status} />
    </section>
  );
}
