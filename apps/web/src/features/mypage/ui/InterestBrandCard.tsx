"use client";

import { HeartIcon } from "lucide-react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";
import type { UserBrandLike } from "@shared/services/userLike";

import { Link, useRouter } from "@/i18n/navigation";

import { Avatar, AvatarFallback, Button } from "@seoul-moment/ui";

import { useDeleteUserBrandLikeMutation } from "../api/useDeleteUserBrandLikeMutation";
import { formatLikeCount } from "../lib/formatLikeCount";

interface InterestBrandCardProps {
  data: UserBrandLike;
  className?: string;
}

const SLOT_COUNT = 4;

export function InterestBrandCard({ data, className }: InterestBrandCardProps) {
  const router = useRouter();
  const { mutate: deleteLike, isPending } = useDeleteUserBrandLikeMutation();

  const products = data.recentProductList.slice(0, SLOT_COUNT);
  const emptySlots = Math.max(0, SLOT_COUNT - products.length);
  const brandHref = `/brand/${data.brandId}`;

  return (
    <article
      className={cn(
        "flex flex-col gap-[20px] rounded-[12px] border border-black/10 p-[20px]",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <Link className="flex min-w-0 items-center gap-3" href={brandHref}>
          <Avatar className="size-10 border border-black/10">
            <AvatarFallback className="text-[14px] font-semibold">
              {data.englishBrandName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="text-body-3 truncate font-semibold text-black">
              {data.englishBrandName}
            </span>
            <span className="text-body-4 truncate text-black/50">
              {data.brandName} | 관심 {formatLikeCount(data.totalLikeCount)}
            </span>
          </div>
        </Link>
        <button
          aria-label="브랜드 좋아요 취소"
          className="shrink-0 cursor-pointer p-2 text-red-500 disabled:opacity-50"
          disabled={isPending}
          onClick={() => deleteLike(data.brandId)}
          type="button"
        >
          <HeartIcon className="size-6 fill-red-500" strokeWidth={1.5} />
        </button>
      </header>

      <div className="grid grid-cols-4 gap-[10px]">
        {products.map((product) => (
          <Link
            className="flex flex-col gap-1"
            href={`/product/${product.productItemId}`}
            key={product.productItemId}
          >
            <figure className="aspect-square overflow-hidden rounded-[6px] bg-black/5">
              <Image
                alt={product.productName}
                className="h-full w-full object-cover"
                height={120}
                src={product.imageUrl}
                unoptimized
                width={120}
              />
            </figure>
            <p className="text-body-5 line-clamp-1 text-black/70">
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
            className="aspect-square rounded-[6px] bg-black/5"
            key={`empty-${i + 1}`}
          />
        ))}
      </div>

      <Button
        className="w-full"
        onClick={() => router.push(brandHref)}
        size="md"
        type="button"
        variant="outline"
      >
        브랜드 더보기
      </Button>
    </article>
  );
}
