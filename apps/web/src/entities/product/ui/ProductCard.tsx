import { HeartIcon, StarIcon } from "lucide-react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import { setComma, toNTCurrency } from "@shared/lib/utils";
import type { ProductItem } from "@shared/services/product";
import { Card } from "@shared/ui/card";

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
          <div className="text-body-4 flex gap-[10px] text-black/40">
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
        <figure
          className={cn(
            "h-[305px] w-[305px]",
            "max-sm:h-[208px] max-sm:w-[208px]",
            imageClassName,
          )}
        >
          <Image
            alt=""
            className="h-full w-full object-cover"
            height={305}
            src={data.image}
            width={305}
          />
        </figure>
      }
      subTitle={
        <span className="text-body-3 font-semibold">
          {toNTCurrency(data?.price ?? 0)}
        </span>
      }
      title={
        <div className="flex flex-col gap-[8px]">
          <span className="text-body-5 font-semibold">
            {data?.brandName ?? ""}
          </span>
          <p className="text-body-3 min-h-[42px]">{data?.productName ?? ""}</p>
        </div>
      }
    />
  );
}
