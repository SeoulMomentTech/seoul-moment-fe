"use client";

import { HeartIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import Empty from "@widgets/empty/ui/Empty";

import { Skeleton } from "@seoul-moment/ui";

import { InterestCategoryChips } from "./InterestCategoryChips";
import { InterestProductRow } from "./InterestProductRow";
import { useDeleteUserProductLikeMutation } from "../api/useDeleteUserProductLikeMutation";
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

  const items = data?.list ?? [];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <InterestCategoryChips
        onChange={setProductCategoryId}
        value={productCategoryId}
      />

      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex items-center gap-[20px] border-b border-black/10 py-[16px] last:border-b-0"
              key={`mypage-like-product-skel-${i + 1}`}
            >
              <Skeleton className="size-[80px] rounded-[6px]" />
              <div className="flex flex-1 flex-col gap-2">
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
        <ul className="flex flex-col [&>li+li]:border-t [&>li+li]:border-black/10">
          {items.map((item) => (
            <li key={item.productItemId}>
              <InterestProductRow
                data={item}
                rightSlot={
                  <button
                    aria-label="좋아요 취소"
                    className="cursor-pointer p-2 text-red-500 disabled:opacity-50"
                    disabled={isDeleting}
                    onClick={() => deleteLike(item.productItemId)}
                    type="button"
                  >
                    <HeartIcon
                      className="size-6 fill-red-500"
                      strokeWidth={1.5}
                    />
                  </button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
