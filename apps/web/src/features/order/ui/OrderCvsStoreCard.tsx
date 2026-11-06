"use client";

import type { ReactNode } from "react";

import { StoreIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
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
    return (
      <EmptyCard
        action={
          <button
            className="text-body-4 text-primary mt-1 cursor-pointer"
            onClick={onReselect}
            type="button"
          >
            {`${t("cvs_store_reselect")} ›`}
          </button>
        }
        title={t("cvs_store_expired")}
        tone="danger"
      />
    );
  }

  if (!store) {
    return (
      <EmptyCard
        hint={t("cvs_store_empty")}
        title={t("cvs_store_empty_title")}
      />
    );
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

interface EmptyCardProps {
  title: string;
  hint?: string;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}

/**
 * 매장 자리를 비워 두는 점선 카드. 매장 카드·스켈레톤과 높이를 맞춰, 매장을 고른 뒤
 * 레이아웃이 뛰지 않게 한다. 문구만 있으면 "여기에 뭔가 채워진다" 는 목표가 보이지 않는다.
 */
function EmptyCard({ title, hint, action, tone = "neutral" }: EmptyCardProps) {
  return (
    <div className="grid min-h-24 place-items-center rounded-[4px] border border-dashed border-black/20 px-4 py-5 text-center">
      <div className="grid justify-items-center gap-1">
        <StoreIcon
          aria-hidden
          className={cn(
            "size-5",
            tone === "danger" ? "text-danger" : "text-black/40",
          )}
        />
        <p
          className={`text-body-3 ${cn(
            "font-semibold",
            tone === "danger" && "text-danger",
          )}`}
        >
          {title}
        </p>
        {hint && <p className="text-body-4 text-neutral">{hint}</p>}
        {action}
      </div>
    </div>
  );
}
