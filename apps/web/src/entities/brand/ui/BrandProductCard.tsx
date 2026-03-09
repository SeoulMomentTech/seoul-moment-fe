import { HeartIcon, StarIcon } from "lucide-react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import { setComma, toNTCurrency } from "@shared/lib/utils";
import type { ProductItem } from "@shared/services/product";
import { Card } from "@shared/ui/card";

export default function BrandProductCard(props: ProductItem) {
  return (
    <Card
      className="gap-2.5"
      contentWrapperClassName="max-sm:gap-[20px]"
      extraInfo={
        <div className="text-body-4 flex gap-2.5 text-black/40">
          <div className="flex items-center gap-1">
            <HeartIcon height={14} width={14} />
            <span>{setComma(props.like)}</span>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon height={14} width={14} />
            <span>
              {props.reviewAverage}({setComma(props.review)})
            </span>
          </div>
        </div>
      }
      image={
        <figure
          className={cn("h-[305px] w-[305px] bg-slate-300", "max-sm:size-52")}
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
          {toNTCurrency(props.price)}
        </span>
      }
      title={
        <div className="flex flex-col gap-2">
          <span className="text-body-5 font-semibold">{props.brandName}</span>
          <p className="text-body-3">{props.productName}</p>
        </div>
      }
    />
  );
}
