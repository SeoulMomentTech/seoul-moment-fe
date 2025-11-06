import { cn } from "@shared/lib/style";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

function Skeleton({ className, rounded, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200",
        rounded && "rounded-md",
        className,
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
