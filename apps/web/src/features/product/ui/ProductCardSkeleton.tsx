import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

interface ProductCardSkeletonProps {
  className?: string;
  imageClassName?: string;
}

export function ProductCardSkeleton({
  className,
  imageClassName,
}: ProductCardSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className={cn("w-full", imageClassName)} />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
