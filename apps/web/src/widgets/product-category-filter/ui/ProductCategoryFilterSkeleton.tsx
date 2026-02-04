"use client";

import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

interface ProductCategoryFilterSkeletonProps {
  className?: string;
}

export function ProductCategoryFilterSkeleton({
  className,
}: ProductCategoryFilterSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading categories"
      className={cn("flex items-center gap-[10px] max-sm:w-max", className)}
      role="status"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="flex flex-col items-center gap-[8px] px-[8px] py-2"
          // eslint-disable-next-line react/no-array-index-key
          key={i}
        >
          <Skeleton className="h-[50px] w-[50px] rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
