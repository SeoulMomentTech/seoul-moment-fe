"use client";

import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

import { EmptyRecent } from "./EmptyRecent";
import { InterestProductRow } from "./InterestProductRow";
import { SimilarToRecentSection } from "./SimilarToRecentSection";
import { useGetUserRecentListQuery } from "../api/useGetUserRecentListQuery";

interface InterestRecentTabProps {
  className?: string;
}

export function InterestRecentTab({ className }: InterestRecentTabProps) {
  const { data, isLoading } = useGetUserRecentListQuery({ count: 20 });
  const items = data?.list ?? [];

  return (
    <div className={cn("flex flex-col gap-10 max-sm:gap-8", className)}>
      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              className="flex items-center gap-[20px] border-b border-black/10 py-[16px] last:border-b-0"
              key={`mypage-recent-skel-${i + 1}`}
            >
              <Skeleton className="size-[80px] rounded-[6px]" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyRecent />
      ) : (
        <ul className="flex flex-col [&>li+li]:border-t [&>li+li]:border-black/10">
          {items.map((item) => (
            <li key={item.productItemId}>
              <InterestProductRow
                data={{
                  productItemId: item.productItemId,
                  brandName: item.brandName,
                  productName: item.productName,
                  imageUrl: item.imageUrl,
                  price: item.price,
                  discountPrice: item.discountPrice,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <SimilarToRecentSection />
    </div>
  );
}
