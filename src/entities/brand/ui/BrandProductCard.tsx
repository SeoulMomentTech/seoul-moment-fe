import { HeartIcon, StarIcon } from "lucide-react";
import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";

export default function BrandProductCard() {
  return (
    <Card
      className="gap-[10px]"
      contentWrapperClassName="max-sm:gap-[20px]"
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
