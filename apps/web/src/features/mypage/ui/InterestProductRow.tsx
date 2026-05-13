import type { MouseEvent, ReactNode } from "react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import { toNTCurrency } from "@shared/lib/utils";

import { Link } from "@/i18n/navigation";

export interface InterestProductRowData {
  productItemId: number;
  brandName: string;
  productName: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
}

interface InterestProductRowProps {
  data: InterestProductRowData;
  rightSlot?: ReactNode;
  className?: string;
}

export function InterestProductRow({
  data,
  rightSlot,
  className,
}: InterestProductRowProps) {
  const hasDiscount =
    typeof data.discountPrice === "number" &&
    data.discountPrice > 0 &&
    data.discountPrice < data.price;
  const displayPrice = hasDiscount ? data.discountPrice! : data.price;

  return (
    <Link
      className={cn(
        "flex items-center gap-[10px] py-[16px] transition-colors hover:bg-black/[0.02]",
        className,
      )}
      href={`/product/${data.productItemId}`}
    >
      <figure className="size-[80px] shrink-0 overflow-hidden bg-black/5">
        <Image
          alt={data.productName}
          className="h-full w-full object-cover"
          height={80}
          src={data.imageUrl}
          unoptimized
          width={80}
        />
      </figure>
      <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
        <div className="flex min-w-0 flex-col gap-[10px]">
          <span className="text-body-5 font-semibold text-black">
            {data.brandName}
          </span>
          <p className="text-body-3 line-clamp-1 text-black">
            {data.productName}
          </p>
        </div>
        <span className="text-body-3 font-semibold text-black">
          {toNTCurrency(displayPrice)}
        </span>
      </div>
      {rightSlot ? (
        <div
          className="shrink-0"
          onClick={(e: MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {rightSlot}
        </div>
      ) : null}
    </Link>
  );
}
