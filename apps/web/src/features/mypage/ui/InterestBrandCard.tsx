"use client";

import { ChevronRight, HeartIcon } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { useLanguage } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { UserBrandLike } from "@shared/services/userLike";

import { Link } from "@/i18n/navigation";

import { useBrandLikeToggle } from "@entities/brand";
import { Avatar, AvatarFallback } from "@seoul-moment/ui";

import { formatLikeCount } from "../lib/formatLikeCount";

interface InterestBrandCardProps {
  data: UserBrandLike;
  className?: string;
}

const SLOT_COUNT = 4;

export function InterestBrandCard({ data, className }: InterestBrandCardProps) {
  const t = useTranslations();
  const locale = useLanguage();
  const { liked, handleToggleLike } = useBrandLikeToggle({
    brandId: data.brandId,
    isLiked: true,
    likeCount: data.totalLikeCount,
  });

  const products = data.recentProductList.slice(0, SLOT_COUNT);
  const emptySlots = Math.max(0, SLOT_COUNT - products.length);
  const brandHref = `/brand/${data.brandId}`;

  return (
    <article
      className={cn(
        "flex flex-col gap-[30px] border border-black/10 px-[20px] py-[24px]",
        "max-sm:border-x-0 max-sm:border-t-0 max-sm:px-0",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-[20px]">
        <Link className="flex min-w-0 items-center gap-[10px]" href={brandHref}>
          <Avatar className="size-10 border border-black/10">
            <AvatarFallback className="text-body-3 font-semibold">
              {data.englishBrandName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex h-10 min-w-0 flex-col gap-2">
            <span className="text-body-3 sm:text-body-2 flex items-center gap-1 truncate font-semibold text-black">
              {data.englishBrandName}
              <ChevronRight
                className="size-[14px] shrink-0 text-black/40 sm:hidden"
                strokeWidth={1.5}
              />
            </span>
            <span className="text-body-5 truncate text-black/40">
              {data.brandName} | 관심{" "}
              {formatLikeCount(data.totalLikeCount, locale)}
            </span>
          </div>
        </Link>
        <button
          aria-label={liked ? t("brand_unlike") : t("brand_like")}
          aria-pressed={liked}
          className={cn(
            "shrink-0 cursor-pointer p-2",
            liked ? "text-red-500" : "text-black/30",
          )}
          onClick={handleToggleLike}
          type="button"
        >
          <HeartIcon
            className={cn("size-6", liked ? "fill-red-500" : "fill-none")}
            strokeWidth={1.5}
          />
        </button>
      </header>

      <div className="no-scrollbar flex gap-[8px] max-sm:overflow-x-auto">
        {products.map((product) => (
          <Link
            className="flex w-[100px] shrink-0 flex-col gap-[10px]"
            href={`/product/${product.productItemId}`}
            key={product.productItemId}
          >
            <figure className="size-[100px] overflow-hidden bg-black/5">
              <Image
                alt={product.productName}
                className="h-full w-full object-cover"
                height={100}
                src={product.imageUrl}
                unoptimized
                width={100}
              />
            </figure>
            <p className="text-body-5 line-clamp-1 text-black">
              {product.productName}
            </p>
            <span className="text-body-5 font-semibold text-black">
              {toNTCurrency(product.price)}
            </span>
          </Link>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            aria-hidden
            className="size-[100px] shrink-0 bg-black/5"
            key={`empty-${i + 1}`}
          />
        ))}
      </div>

      <Link
        className="text-body-3 flex w-full items-center justify-center gap-1 rounded-[4px] border border-black/20 bg-white px-[16px] py-[12px] font-semibold text-black max-sm:hidden"
        href={brandHref}
      >
        {t("brand_more")}
      </Link>
    </article>
  );
}
