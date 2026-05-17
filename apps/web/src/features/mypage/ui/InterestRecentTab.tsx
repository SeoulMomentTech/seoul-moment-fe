"use client";

import ProductCard from "@entities/product/ui/ProductCard";
import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { Skeleton } from "@seoul-moment/ui";

import { EmptyRecent } from "./EmptyRecent";
import { SimilarToRecentSection } from "./SimilarToRecentSection";
import { useGetUserRecentListQuery } from "../api/useGetUserRecentListQuery";
import { toProductItem } from "../lib/adapters";
import {
  IS_DEV_MYPAGE_MOCK,
  MOCK_INTEREST_RECENT_ITEMS,
} from "../mocks/interest";

interface InterestRecentTabProps {
  className?: string;
}

const GRID_CLASS =
  "grid grid-cols-4 gap-x-[20px] gap-y-[40px] max-sm:grid-cols-2 max-sm:gap-x-[10px] max-sm:gap-y-[30px]";

export function InterestRecentTab({ className }: InterestRecentTabProps) {
  const { data, isLoading } = useGetUserRecentListQuery({ count: 20 });
  const items = data?.list?.length
    ? data.list
    : IS_DEV_MYPAGE_MOCK
      ? MOCK_INTEREST_RECENT_ITEMS
      : [];

  return (
    <div className={cn("flex flex-col gap-10 max-sm:gap-8", className)}>
      {isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex flex-col gap-3"
              key={`mypage-recent-skel-${i + 1}`}
            >
              <Skeleton className="aspect-square w-full rounded-[6px]" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyRecent />
      ) : (
        <ul className={GRID_CLASS}>
          {items.map((item) => (
            <li key={item.productItemId}>
              <Link className="h-fit" href={`/product/${item.productItemId}`}>
                <ProductCard
                  className="h-full flex-1"
                  data={toProductItem(item)}
                  imageClassName={cn(
                    "aspect-square h-auto w-full",
                    "max-sm:w-full max-sm:max-h-[150px] max-sm:min-h-[150px]",
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SimilarToRecentSection />
    </div>
  );
}
