import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@shared/lib/style";
import { setComma } from "@shared/lib/utils";
import type { ProductItem } from "@shared/services/product";
import { Card } from "@shared/ui/card";

export default function BrandProductCard(props: ProductItem) {
  return (
    <Card
      className="gap-[10px]"
      contentWrapperClassName="max-sm:gap-[20px]"
      extraInfo={
        <div className="text-body-4 flex gap-[10px] text-black/40">
          <div className="flex items-center gap-[4px]">
            <HeartIcon height={14} width={14} />
            <span>{setComma(props.like)}</span>
          </div>
          <div className="flex items-center gap-[4px]">
            <StarIcon height={14} width={14} />
            <span>
              {props.reviewAverage}({setComma(props.review)})
            </span>
          </div>
        </div>
      }
      image={
        <figure
          className={cn(
            "h-[305px] w-[305px] bg-slate-300",
            "max-sm:h-[208px] max-sm:w-[208px]",
          )}
        >
          <Image
            alt=""
            className="h-full w-full object-cover"
            height={350}
            src={props.image}
            width={350}
          />
        </figure>
      }
      subTitle={
        <span className="text-body-3 font-semibold">
          {setComma(props.price)}
        </span>
      }
      title={
        <div className="flex flex-col gap-[8px]">
          <span className="text-body-5 font-semibold">{props.brandName}</span>
          <p className="text-body-3">{props.productName}</p>
        </div>
      }
    />
  );
}
