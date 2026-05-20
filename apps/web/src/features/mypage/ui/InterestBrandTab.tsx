"use client";

import { useCallback, useRef } from "react";

import { HeartIcon } from "lucide-react";

import { useIntersectionObserver } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import Empty from "@widgets/empty/ui/Empty";

import { Skeleton } from "@seoul-moment/ui";

import { InterestBrandCard } from "./InterestBrandCard";
import { useGetUserLikeBrandListQuery } from "../api/useGetUserLikeBrandListQuery";
import {
  IS_DEV_MYPAGE_MOCK,
  MOCK_INTEREST_BRAND_ITEMS,
} from "../mocks/interest";

interface InterestBrandTabProps {
  className?: string;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-[17px] max-sm:grid-cols-1 max-sm:gap-0";

export function InterestBrandTab({ className }: InterestBrandTabProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetUserLikeBrandListQuery({ count: 20 });

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, isFetchingNextPage]);

  useIntersectionObserver({
    target: loadMoreRef,
    enabled: hasNextPage,
    rootMargin: "200px",
    onIntersect: handleIntersect,
  });

  const brands = data?.length
    ? data
    : IS_DEV_MYPAGE_MOCK
      ? MOCK_INTEREST_BRAND_ITEMS
      : [];

  if (isLoading) {
    return (
      <div className={cn(GRID_CLASS, className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton
            className="h-[300px] max-sm:h-[260px] max-sm:rounded-none"
            key={`mypage-like-brand-skel-${i + 1}`}
          />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <Empty
        className="py-[60px]"
        description="관심 브랜드가 없습니다"
        icon={<HeartIcon className="size-10 text-black/20" />}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-[17px]", className)}>
      <div className={GRID_CLASS}>
        {brands.map((brand) => (
          <InterestBrandCard data={brand} key={brand.brandId} />
        ))}
      </div>

      {hasNextPage ? (
        <div aria-hidden className="h-1" ref={loadMoreRef} />
      ) : null}

      {isFetchingNextPage ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              className="h-[300px] max-sm:h-[260px] max-sm:rounded-none"
              key={`mypage-like-brand-more-skel-${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
