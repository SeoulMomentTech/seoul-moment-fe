"use client";

import { ShoppingCartIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { toNTCurrency } from "@shared/lib/utils";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import { useGetUserRecentListQuery } from "@entities/product";
import { Button, Skeleton } from "@seoul-moment/ui";

/**
 * 빈 장바구니. 아이콘 + 한 줄로 끝내지 않는다 — 활성화 지점이라 상품 목록으로 보내는 CTA 와
 * 최근 본 상품을 함께 둔다. `/cart` 는 로그인 필수라 최근 본 상품에 조건 분기가 필요 없다.
 */
export function CartEmpty() {
  const t = useTranslations();
  const { data, isLoading } = useGetUserRecentListQuery({ count: 10 });
  const recent = data?.list ?? [];

  return (
    <div>
      <div className="py-18 grid justify-items-center gap-4 px-5 text-center max-sm:py-12">
        <ShoppingCartIcon className="size-10 text-black/20" strokeWidth={1.6} />
        <h2 className="text-body-1 font-semibold tracking-[-0.01em]">
          {t("cart_empty")}
        </h2>
        <p className="text-body-3 text-neutral -mt-1.5 max-w-[34ch]">
          {t("cart_empty_description")}
        </p>
        <Button asChild className="h-12 rounded-[4px] px-6 max-sm:w-full">
          <Link href="/product">{t("discover_products")}</Link>
        </Button>
      </div>

      {(isLoading || recent.length > 0) && (
        <div className="border-t border-black/10 pb-10 pt-7">
          <h3 className="text-body-2 mb-4 font-semibold">
            {t("recently_viewed")}
          </h3>
          <ul className="flex gap-4 overflow-x-auto pb-1">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <li
                    className="w-38 shrink-0 max-sm:w-32"
                    key={`cart-recent-skeleton-${index + 1}`}
                  >
                    <Skeleton className="aspect-3/4 w-full" />
                    <Skeleton className="mt-2 h-3 w-12" />
                    <Skeleton className="mt-1.5 h-4 w-full" />
                  </li>
                ))
              : recent.map((item) => (
                  <li
                    className="w-38 shrink-0 max-sm:w-32"
                    key={item.productItemId}
                  >
                    <Link href={`/product/${item.productItemId}`}>
                      <BaseImage
                        alt={item.productName}
                        className="aspect-3/4 w-full border border-black/[0.07] object-cover"
                        height={400}
                        src={item.imageUrl}
                        unoptimized
                        width={300}
                      />
                      <p className="text-body-5 mt-2 font-semibold">
                        {item.brandName}
                      </p>
                      <p className="text-body-4 mt-0.5 truncate">
                        {item.productName}
                      </p>
                      <p className="text-body-4 mt-1 font-semibold tabular-nums">
                        {toNTCurrency(item.discountPrice || item.price)}
                      </p>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      )}
    </div>
  );
}
