"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { GetProductDetailRes } from "@shared/services/product";

interface ProductPriceProps
  extends Pick<GetProductDetailRes, "price" | "discountPrice"> {
  className?: string;
}

/** 정상가 / 판매가. 할인가가 있으면 정상가에 취소선을 긋고 판매가를 강조한다. */
export default function ProductPrice({
  price,
  discountPrice,
  className,
}: ProductPriceProps) {
  const t = useTranslations();

  const isDiscounted = discountPrice > 0;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {price > 0 && (
        <div className={cn("text-body-3 flex", "max-sm:text-body-4")}>
          <span className="min-w-30">{t("price")}</span>
          <span
            className={cn(
              "text-black",
              isDiscounted && "text-black/40 line-through",
            )}
          >
            {toNTCurrency(price)}
          </span>
        </div>
      )}
      {isDiscounted && (
        <div className="flex items-center">
          <span className={cn("text-body-3 min-w-30", "max-sm:text-body-4")}>
            {t("sale_price")}
          </span>
          <span
            className={cn("text-body-1 font-semibold", "max-sm:text-body-2")}
          >
            {toNTCurrency(discountPrice)}
          </span>
        </div>
      )}
    </div>
  );
}
