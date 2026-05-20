"use client";

import { Suspense, useState } from "react";

import { HeartIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import Empty from "@widgets/empty/ui/Empty";

import {
  useCreateUserProductLikeMutation,
  useDeleteUserProductLikeMutation,
} from "@entities/product";
import { Skeleton } from "@seoul-moment/ui";

import {
  InterestCategoryChips,
  InterestCategoryChipsSkeleton,
} from "./InterestCategoryChips";
import { InterestProductRow } from "./InterestProductRow";
import { useGetUserLikeProductListQuery } from "../api/useGetUserLikeProductListQuery";
import { useInterestProductCategory } from "../model/useInterestProductCategory";

interface InterestProductTabProps {
  className?: string;
}

export function InterestProductTab({ className }: InterestProductTabProps) {
  const { productCategoryId, setProductCategoryId } =
    useInterestProductCategory();
  const { data, isLoading } = useGetUserLikeProductListQuery({
    productCategoryId,
    count: 30,
  });
  const { mutate: deleteLike, isPending: isDeleting } =
    useDeleteUserProductLikeMutation();
  const { mutate: createLike, isPending: isCreating } =
    useCreateUserProductLikeMutation();

  const [unlikedIds, setUnlikedIds] = useState<Set<number>>(new Set());

  const items = data?.list ?? [];

  const togglePending = isDeleting || isCreating;

  const handleToggleLike = (productItemId: number) => {
    const isUnliked = unlikedIds.has(productItemId);

    if (isUnliked) {
      setUnlikedIds((prev) => {
        const next = new Set(prev);
        next.delete(productItemId);
        return next;
      });
      createLike(productItemId, {
        onError: () => {
          setUnlikedIds((prev) => new Set(prev).add(productItemId));
        },
      });
      return;
    }

    setUnlikedIds((prev) => new Set(prev).add(productItemId));
    deleteLike(productItemId, {
      onError: () => {
        setUnlikedIds((prev) => {
          const next = new Set(prev);
          next.delete(productItemId);
          return next;
        });
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Suspense fallback={<InterestCategoryChipsSkeleton />}>
        <InterestCategoryChips
          onChange={setProductCategoryId}
          value={productCategoryId}
        />
      </Suspense>

      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex items-center gap-[10px] border-b border-black/10 py-[16px]"
              key={`mypage-like-product-skel-${i + 1}`}
            >
              <Skeleton className="size-[80px]" />
              <div className="flex flex-1 flex-col gap-[16px]">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="size-6 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty
          className="py-[60px]"
          description="관심 상품이 없습니다"
          icon={<HeartIcon className="size-10 text-black/20" />}
        />
      ) : (
        <ul className="flex flex-col [&>li]:border-b [&>li]:border-black/10">
          {items.map((item) => {
            const liked = !unlikedIds.has(item.productItemId);
            return (
              <li key={item.productItemId}>
                <InterestProductRow
                  data={item}
                  rightSlot={
                    <button
                      aria-label={liked ? "좋아요 취소" : "좋아요"}
                      aria-pressed={liked}
                      className={cn(
                        "cursor-pointer p-2 disabled:opacity-50",
                        liked ? "text-red-500" : "text-black/30",
                      )}
                      disabled={togglePending}
                      onClick={() => handleToggleLike(item.productItemId)}
                      type="button"
                    >
                      <HeartIcon
                        className={cn(
                          "size-6",
                          liked ? "fill-red-500" : "fill-none",
                        )}
                        strokeWidth={1.5}
                      />
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
