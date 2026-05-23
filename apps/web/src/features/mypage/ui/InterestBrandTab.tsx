"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HeartIcon } from "lucide-react";

import { debounce } from "es-toolkit";

import { useIntersectionObserver } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import Empty from "@widgets/empty/ui/Empty";

import {
  useCreateUserBrandLikeMutation,
  useDeleteUserBrandLikeMutation,
} from "@entities/brand";
import { Skeleton } from "@seoul-moment/ui";

import { InterestBrandCard } from "./InterestBrandCard";
import { useGetUserLikeBrandListQuery } from "../api/useGetUserLikeBrandListQuery";

interface InterestBrandTabProps {
  className?: string;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-[17px] max-sm:grid-cols-1 max-sm:gap-0";

const LIKE_DEBOUNCE_MS = 400;

type LikeFlushFn = ((desired: boolean) => void) & {
  cancel(): void;
  flush(): void;
};

export function InterestBrandTab({ className }: InterestBrandTabProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetUserLikeBrandListQuery({ count: 20 });
  const { mutate: createLike } = useCreateUserBrandLikeMutation();
  const { mutate: deleteLike } = useDeleteUserBrandLikeMutation();

  const [unlikedIds, setUnlikedIds] = useState<Set<number>>(new Set());
  const unlikedIdsRef = useRef(unlikedIds);
  const syncedLikedMapRef = useRef(new Map<number, boolean>());
  const flushMapRef = useRef(new Map<number, LikeFlushFn>());

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, isFetchingNextPage]);

  useIntersectionObserver({
    target: loadMoreRef,
    enabled: hasNextPage,
    rootMargin: "200px",
    onIntersect: handleIntersect,
  });

  const updateUnliked = (updater: (prev: Set<number>) => Set<number>) => {
    const next = updater(unlikedIdsRef.current);
    unlikedIdsRef.current = next;
    setUnlikedIds(next);
  };

  const getFlush = (brandId: number): LikeFlushFn => {
    const existing = flushMapRef.current.get(brandId);
    if (existing) return existing;

    const fn = debounce((desired: boolean) => {
      const synced = syncedLikedMapRef.current.get(brandId) ?? true;
      if (desired === synced) return;

      syncedLikedMapRef.current.set(brandId, desired);

      const onError = () => {
        syncedLikedMapRef.current.set(brandId, synced);
        updateUnliked((prev) => {
          const reverted = new Set(prev);
          if (synced) reverted.delete(brandId);
          else reverted.add(brandId);
          return reverted;
        });
      };

      if (desired) {
        createLike(brandId, { onError });
      } else {
        deleteLike(brandId, { onError });
      }
    }, LIKE_DEBOUNCE_MS);

    flushMapRef.current.set(brandId, fn);
    return fn;
  };

  useEffect(() => {
    const flushMap = flushMapRef.current;
    return () => {
      flushMap.forEach((fn) => fn.flush());
    };
  }, []);

  const handleToggleLike = (brandId: number) => {
    const wasUnliked = unlikedIdsRef.current.has(brandId);
    const willBeLiked = wasUnliked;

    updateUnliked((prev) => {
      const next = new Set(prev);
      if (wasUnliked) next.delete(brandId);
      else next.add(brandId);
      return next;
    });

    getFlush(brandId)(willBeLiked);
  };

  const brands = data ?? [];

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
        {brands.map((brand) => {
          const liked = !unlikedIds.has(brand.brandId);
          return (
            <InterestBrandCard
              data={brand}
              key={brand.brandId}
              liked={liked}
              onToggleLike={handleToggleLike}
            />
          );
        })}
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
