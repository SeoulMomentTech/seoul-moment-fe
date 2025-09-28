import { HeartIcon, StarIcon } from "lucide-react";
import { cn } from "@/shared/lib/style";
import { setComma } from "@/shared/lib/utils";
import type { ProductItem } from "@/shared/services/product";
import { Card } from "@/shared/ui/card";

interface ProductCardProps {
  className?: string;
  imageClassName?: string;
  contentWrapperClassName?: string;
  hideExtraInfo?: boolean;
  data: ProductItem;
}

export default function ProductCard({
  className,
  imageClassName,
  contentWrapperClassName,
  hideExtraInfo,
  data,
}: ProductCardProps) {
  return (
    <Card
      className={cn("gap-[10px]", className)}
      contentWrapperClassName={cn(
        "gap-[16px] max-sm:gap-[20px]",
        contentWrapperClassName,
      )}
      extraInfo={
        hideExtraInfo ? (
          <></>
        ) : (
          <div className="flex gap-[10px] text-[13px] text-black/40">
            <div className="flex items-center gap-[4px]">
              <HeartIcon height={14} width={14} />
              <span>{setComma(data?.like ?? 0)}</span>
            </div>
            <div className="flex items-center gap-[4px]">
              <StarIcon height={14} width={14} />
              <span>
                {data?.reviewAverage ?? 0}({setComma(data?.review ?? 0)})
              </span>
            </div>
          </div>
        )
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
      subTitle={
        <span className="text-[14px] font-semibold">
          {setComma(data?.price ?? 0)}
        </span>
      }
      title={
        <div className="flex flex-col gap-[8px]">
          <span className="text-[12px] font-semibold">
            {data?.brandName ?? ""}
          </span>
          <p className="text-[14px]">{data?.productName ?? ""}</p>
        </div>
      }
    />
  );
}
