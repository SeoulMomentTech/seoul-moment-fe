"use client";

import { useTranslations } from "next-intl";

import type { GetLogisticsCvsStoreRes } from "@shared/services/logistics";

import { Skeleton } from "@seoul-moment/ui";

import { getCvsChainLabel } from "../model/cvsChain";

interface OrderCvsStoreCardProps {
  store: GetLogisticsCvsStoreRes | undefined;
  isLoading: boolean;
  isExpired: boolean;
  onReselect(): void;
}

/** 고른 매장. 없으면 안내, 조회 중이면 스켈레톤, 만료면 다시 고르라는 문구 */
export function OrderCvsStoreCard({
  store,
  isLoading,
  isExpired,
  onReselect,
}: OrderCvsStoreCardProps) {
  const t = useTranslations();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-[4px]" />;
  }

  if (isExpired) {
    return <p className="text-body-4 text-danger">{t("cvs_store_expired")}</p>;
  }

  if (!store) {
    return <p className="text-body-4 text-neutral">{t("cvs_store_empty")}</p>;
  }

  return (
    <div className="text-body-3 grid gap-1 rounded-[4px] border border-black/10 p-4">
      <p className="font-semibold">
        {`${getCvsChainLabel(store.chain)} ${store.storeName} · ${store.storeId}`}
      </p>
      <p className="text-black/70">{store.storeAddress}</p>
      <button
        className="text-body-4 text-primary mt-1 w-fit cursor-pointer"
        onClick={onReselect}
        type="button"
      >
        {`${t("cvs_store_reselect")} ›`}
      </button>
    </div>
  );
}
