"use client";

import { XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import { QuantityStepper } from "@shared/ui/quantity-stepper";

import {
  formatCartLineOptions,
  getMaxLineQuantity,
  LOW_STOCK_THRESHOLD,
} from "@entities/cart";

import type { DraftLine } from "../model/useAddToCartDraft";

interface DraftLineListProps {
  lines: ReadonlyArray<DraftLine>;
  unitPrice: number;
  totalAmount: number;
  /** 고정형은 조합이 항상 1개라 삭제 버튼을 렌더하지 않는다 */
  removable: boolean;
  onQuantityChange(key: string, quantity: number): void;
  onRemove(key: string): void;
  compact?: boolean;
  className?: string;
}

/**
 * 고른 조합이 쌓이는 회색 박스와 총 상품 금액. 디자인(Figma)의 "상세정보" 블록이다.
 * 조합이 없으면 박스와 금액을 모두 렌더하지 않는다 — 빈 박스와 NT$0 은 노이즈다.
 */
export function DraftLineList({
  lines,
  unitPrice,
  totalAmount,
  removable,
  onQuantityChange,
  onRemove,
  compact = false,
  className,
}: DraftLineListProps) {
  const t = useTranslations();

  if (!lines.length) return null;

  return (
    <div className={className}>
      <div className="flex flex-col bg-black/5 px-4 py-3">
        {lines.map((line, index) => {
          // 조합을 그대로 고른 라인은 드롭다운에 보인 문구를 그대로 쓴다.
          const optionText = line.label ?? formatCartLineOptions(line.options);
          // 재고를 아는 조합은 거기까지만 올릴 수 있다.
          const maxQuantity = getMaxLineQuantity(line.stockQuantity);
          // 상한에 왜 걸렸는지 보이게 남은 개수를 알린다. 넉넉하면 안 띄운다.
          const lowStock =
            line.stockQuantity != null &&
            line.stockQuantity > 0 &&
            line.stockQuantity < LOW_STOCK_THRESHOLD
              ? line.stockQuantity
              : undefined;

          return (
            <div
              className={cn(
                "flex items-center gap-4 pb-4 pt-3",
                index === lines.length - 1 && "pb-3",
              )}
              key={line.key}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-body-3 leading-none text-black/80",
                    compact && "text-body-4",
                  )}
                >
                  {optionText}
                </p>
                {lowStock != null && (
                  <p className="text-body-5 text-brand mt-1.5 font-semibold tabular-nums">
                    {t("stock_left", { stock: lowStock })}
                  </p>
                )}
              </div>

              <div
                className={cn("gap-7.5 flex items-center", compact && "gap-1")}
              >
                <QuantityStepper
                  label={optionText}
                  max={maxQuantity}
                  onChange={(quantity) => onQuantityChange(line.key, quantity)}
                  value={line.quantity}
                />

                <div className="flex items-center justify-center gap-2">
                  {!compact && (
                    <span className="text-body-3 font-semibold tabular-nums text-[#212529]">
                      {toNTCurrency(unitPrice * line.quantity)}
                    </span>
                  )}
                  {removable && (
                    <button
                      aria-label={t("remove_from_cart")}
                      className="grid cursor-pointer place-items-center p-1"
                      onClick={() => onRemove(line.key)}
                      type="button"
                    >
                      <XIcon height={16} width={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-2 py-5",
          compact && "justify-between pb-2.5 pt-5",
        )}
      >
        <span
          className={cn("text-body-5", compact && "text-body-2 font-semibold")}
        >
          {t("total_product_amount")}
        </span>
        <span
          className={cn(
            "text-body-1 font-semibold tabular-nums",
            compact && "text-title-4",
          )}
        >
          {toNTCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
