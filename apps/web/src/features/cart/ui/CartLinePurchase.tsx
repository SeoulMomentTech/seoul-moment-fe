"use client";

import { ExternalLinkIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useMediaQuery, useOpen } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { External } from "@shared/services/product";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@seoul-moment/ui";

import { openExternalUrl } from "../lib/openExternal";

interface CartLinePurchaseProps {
  /** 담을 때 스냅샷해 둔 외부 몰 목록 */
  external: ReadonlyArray<External>;
  className?: string;
}

const TRIGGER_CLASS =
  "text-body-4 inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-black/20 px-3 py-2";

/**
 * 라인 단위 외부 몰 이동. 자체 결제가 없으므로 이게 유일하게 실제로 동작하는 구매 동선이다.
 *
 * 몰이 하나면 바로 새 창, 여러 개면 고르게 한다. 비어 있으면 아무것도 렌더하지 않는다 —
 * 구매처가 없는 상품에 죽은 버튼을 두지 않는다.
 */
export function CartLinePurchase({
  external,
  className,
}: CartLinePurchaseProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const { isOpen, open, close, update } = useOpen();

  if (!external.length) return null;

  const label = (
    <>
      {t("buy_at_external")}
      <ExternalLinkIcon className="text-neutral" height={13} width={13} />
    </>
  );

  if (external.length === 1) {
    return (
      <button
        className={cn(TRIGGER_CLASS, className)}
        onClick={() => openExternalUrl(external[0].url)}
        type="button"
      >
        {label}
      </button>
    );
  }

  const list = (
    <div className="grid gap-2 py-2">
      {external.map((item) => (
        <button
          className="flex h-[52px] cursor-pointer items-center justify-center rounded-[4px] border border-black/20"
          key={item.id}
          onClick={() => {
            openExternalUrl(item.url);
            close();
          }}
          type="button"
        >
          <span className="text-body-3">{item.name}</span>
        </button>
      ))}
    </div>
  );

  const trigger = (
    <button
      className={cn(TRIGGER_CLASS, className)}
      onClick={open}
      type="button"
    >
      {label}
    </button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer onOpenChange={update} open={isOpen}>
          <DrawerContent className="px-5 pb-6">
            <div className="flex flex-col gap-4 pt-5">
              <DrawerTitle className="text-title-4 text-center font-bold">
                {t("buy_at_external")}
              </DrawerTitle>
              {list}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Dialog onOpenChange={update} open={isOpen}>
        <DialogContent className="gap-4 p-6 sm:max-w-[420px]">
          <DialogTitle className="text-title-4 font-bold">
            {t("buy_at_external")}
          </DialogTitle>
          {list}
        </DialogContent>
      </Dialog>
    </>
  );
}
