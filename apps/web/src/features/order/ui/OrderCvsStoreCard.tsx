"use client";

import { useTranslations } from "next-intl";

import type { GetLogisticsCvsStoreRes } from "@shared/services/logistics";

import { Skeleton } from "@seoul-moment/ui";

import { getCvsChainLabel } from "../model/cvsChain";

interface OrderCvsStoreCardProps {
  store: GetLogisticsCvsStoreRes | undefined;
  isLoading: boolean;
  isExpired: boolean;
  /** 만료(404)가 아닌 조회 실패. 토큰은 살아 있어 다시 시도할 수 있다 */
  isError: boolean;
  onReselect(): void;
  onRetry(): void;
}

/**
 * 고른 매장. 없으면 안내, 조회 중이면 스켈레톤, 만료면 다시 고르라는 문구, 그 밖 실패면
 * 다시 시도 버튼 — 방금 지도를 다녀왔는데 빈 안내만 보이면 왜 비었는지 알 길이 없다.
 */
export function OrderCvsStoreCard({
  store,
  isLoading,
  isExpired,
  isError,
  onReselect,
  onRetry,
}: OrderCvsStoreCardProps) {
  const t = useTranslations();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-[4px]" />;
  }

  if (isError) {
    return (
      <button
        className="text-body-4 text-danger w-fit cursor-pointer underline underline-offset-2"
        onClick={onRetry}
        type="button"
      >
        {t("please_try_again")}
      </button>
    );
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
