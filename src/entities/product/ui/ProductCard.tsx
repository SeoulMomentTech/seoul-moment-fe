import { HeartIcon, StarIcon } from "lucide-react";
import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";

interface ProductCardProps {
  className?: string;
  imageClassName?: string;
  contentWrapperClassName?: string;
}

export default function ProductCard({
  className,
  imageClassName,
  contentWrapperClassName,
}: ProductCardProps) {
  return (
    <Card
      className={cn("gap-[10px]", className)}
      contentWrapperClassName={cn(
        "gap-[16px] max-sm:gap-[20px]",
        contentWrapperClassName,
      )}
      extraInfo={
        <div className="flex gap-[10px] text-[13px] text-black/40">
          <div className="flex items-center gap-[4px]">
            <HeartIcon height={14} width={14} />
            <span>21794</span>
          </div>
          <div className="flex items-center gap-[4px]">
            <StarIcon height={14} width={14} />
            <span>4.5(330)</span>
          </div>
        </div>
      }
      image={
        <div
          className={cn(
            "h-[305px] w-[305px] bg-slate-300",
            "max-sm:h-[208px] max-sm:w-[208px]",
            imageClassName,
          )}
        />
      }
      subTitle={<span className="text-[14px] font-semibold">189,000원</span>}
      title={
        <div className="flex flex-col gap-[8px]">
          <span className="text-[12px] font-semibold">51퍼센트</span>
          <p className="text-[14px]">TUNNEL LINING TROUSE</p>
        </div>
      }
    />
  );
}
