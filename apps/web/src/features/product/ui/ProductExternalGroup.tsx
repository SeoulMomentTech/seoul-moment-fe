"use client";

import Image from "next/image";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";

export interface ProductExternalItem {
  id: number;
  url: string;
  imageUrl: string;
  name: string;
}

interface ProductExternalGroupProps {
  items: ProductExternalItem[];
  className?: string;
}

export default function ProductExternalGroup({
  items,
  className,
}: ProductExternalGroupProps) {
  if (!items?.length) return null;

  return (
    <div
      className={cn(
        "flex gap-[8px]",
        items.length > 1 && "grid grid-cols-2",
        className,
      )}
      data-role="product-external-group"
    >
      {items.map((item) => (
        <Button
          className="h-[46px] w-full"
          key={item.id}
          onClick={() => window.open(item.url, "_blank", "noreferrer")}
          role="link"
          variant="outline"
        >
          <Image
            alt={item.name}
            height={16}
            src={item.imageUrl}
            unoptimized
            width={70}
          />
        </Button>
      ))}
    </div>
  );
}
