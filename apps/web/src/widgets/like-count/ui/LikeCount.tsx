import { HeartIcon } from "lucide-react";
import { cn } from "@shared/lib/style";
import { setComma } from "@shared/lib/utils";

interface LikeCountProps {
  className?: string;
  countClassName?: string;
  iconSize?: number;
  count?: number;
  onClick?(): void;
}

export function LikeCount({
  className,
  iconSize,
  count,
  countClassName,
  onClick,
}: LikeCountProps) {
  return (
    <div
      className={cn("flex items-center gap-[4px] text-black/40", className)}
      onClick={onClick}
    >
      <HeartIcon
        className="text-black/40"
        height={iconSize ?? 14}
        width={iconSize ?? 14}
      />
      {count && (
        <span className={cn("text-body-4", countClassName)}>
          {setComma(count)}
        </span>
      )}
    </div>
  );
}
