"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { GetProductDetailRes } from "@shared/services/product";

interface ProductDetailInfoRow {
  label: string;
  value: string;
}

interface ProductDetailInfoProps
  extends Pick<
    GetProductDetailRes,
    "origin" | "shippingInfo" | "shippingCost" | "option"
  > {
  className?: string;
}

/** 원산지, 배송 정보, 옵션(색상/사이즈) 요약 */
export default function ProductDetailInfo({
  origin,
  shippingInfo,
  shippingCost,
  option,
  className,
}: ProductDetailInfoProps) {
  const t = useTranslations();

  const rows = [
    origin && { label: t("place_of_origin"), value: origin },
    shippingInfo > 0 && {
      label: t("shipping_information"),
      value: t("within_days", { n: shippingInfo }),
    },
    shippingCost > 0 && {
      label: t("shipping_fee"),
      value: toNTCurrency(shippingCost),
    },
    option?.COLOR?.length && {
      label: t("color"),
      value: option.COLOR[0].value,
    },
    option?.SIZE?.length && {
      label: t("size"),
      value: option.SIZE.map((item) => item.value).join("/"),
    },
  ].filter((row): row is ProductDetailInfoRow => Boolean(row));

  return (
    <div
      className={cn(
        "pb-12.5 flex flex-col gap-5 pt-5",
        "max-sm:gap-4 max-sm:pb-4",
        className,
      )}
      data-role="product-detail-info"
    >
      {rows.map(({ label, value }) => (
        <div
          className={cn("text-body-3 flex", "max-sm:text-body-4")}
          key={label}
        >
          <span className="min-w-32.5">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
