"use client";

import ProductCard from "@entities/product/ui/ProductCard";
import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { Skeleton } from "@seoul-moment/ui";

import { useGetUserRecentRecommendListQuery } from "../api/useGetUserRecentRecommendListQuery";
import { toProductItem } from "../lib/adapters";

interface SimilarToRecentSectionProps {
  className?: string;
}

export function SimilarToRecentSection({
  className,
}: SimilarToRecentSectionProps) {
  const { data, isLoading } = useGetUserRecentRecommendListQuery();
  const items = data?.list ?? [];

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <h3 className="text-body-1 font-semibold text-black">
        최근 본 상품과 비슷한 상품
      </h3>
      {isLoading ? (
        <div className="grid grid-cols-4 gap-x-[20px] gap-y-[40px] max-sm:grid-cols-2 max-sm:gap-x-[10px] max-sm:gap-y-[30px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex flex-col gap-3"
              key={`mypage-similar-skel-${i + 1}`}
            >
              <Skeleton className="aspect-square w-full rounded-[6px]" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-4 gap-x-[20px] gap-y-[40px] max-sm:grid-cols-2 max-sm:gap-x-[10px] max-sm:gap-y-[30px]">
          {items.map((item) => (
            <li key={item.productItemId}>
              <Link className="block" href={`/product/${item.productItemId}`}>
                <ProductCard
                  data={toProductItem(item)}
                  imageClassName="aspect-square h-62 w-full max-sm:size-[150px]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
