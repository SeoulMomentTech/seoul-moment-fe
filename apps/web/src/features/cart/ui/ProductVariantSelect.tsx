"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@shared/ui/select";

import { LOW_STOCK_THRESHOLD } from "@entities/cart";
import type { ProductVariantChoice } from "@entities/product";

interface ProductVariantSelectProps {
  choices: ReadonlyArray<ProductVariantChoice>;
  onPick(variantId: number): void;
  /** 살 수 있는 조합이 하나도 없을 때. 열어봐야 전부 회색이라 트리거째로 잠근다 */
  soldOut?: boolean;
  className?: string;
}

/**
 * 조합(SKU) 드롭다운. 축을 하나씩 고르는 대신 완성된 조합을 한 번에 고른다.
 *
 * 조합이 곧 SKU 라 재고·품절을 조합 단위 사실 그대로 표시할 수 있고, 고른 값이
 * `productVariantId` 라 담을 때 번역이 필요 없다.
 *
 * 값을 유지하지 않는다 — 조합을 고르면 아래 라인 목록에 쌓이고, 같은 조합을 다시
 * 고르면 수량이 올라간다. controlled value 를 두면 같은 값 재선택에
 * `onValueChange` 가 오지 않아 두 번째 담기가 막힌다(축별 선택과 같은 이유).
 */
export function ProductVariantSelect({
  choices,
  onPick,
  soldOut = false,
  className,
}: ProductVariantSelectProps) {
  const t = useTranslations();

  if (!choices.length) return null;

  return (
    <Select
      disabled={soldOut}
      onValueChange={(next) => onPick(Number(next))}
      value={undefined}
    >
      <SelectTrigger
        aria-label={soldOut ? t("sold_out") : t("select")}
        className={cn("text-body-3 h-12 rounded-[4px] px-3", className)}
      >
        <span className={cn(soldOut ? "font-semibold" : "text-neutral")}>
          {soldOut ? t("sold_out") : t("select")}
        </span>
      </SelectTrigger>
      <SelectContent>
        {choices.map((choice) => {
          // 고르기 전에 보이는 게 유용하다 — 담고 나서 스테퍼가 안 올라가는 것보다 낫다.
          const lowStock =
            choice.isPurchasable &&
            choice.stockQuantity > 0 &&
            choice.stockQuantity < LOW_STOCK_THRESHOLD;

          return (
            <SelectItem
              disabled={!choice.isPurchasable}
              key={choice.variantId}
              value={String(choice.variantId)}
            >
              {choice.isPurchasable
                ? choice.label
                : `${choice.label} · ${t("sold_out")}`}
              {lowStock && (
                <span className="text-brand ml-1.5 tabular-nums">
                  {t("stock_left", { stock: choice.stockQuantity })}
                </span>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
