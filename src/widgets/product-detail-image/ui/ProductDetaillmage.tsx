import Image from "next/image";
import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/style";

interface ProductDetailImageProps extends PropsWithChildren {
  showMore: boolean;
  imageSrc: string;
}

export default function ProductDetaillmage({
  showMore,
  imageSrc,
  children,
}: ProductDetailImageProps) {
  return (
    <div className="relative px-[20px] max-sm:px-0">
      <div className={cn("h-[800px] bg-gray-300", showMore && "h-full")}>
        <Image
          alt=""
          className={cn(
            "h-full w-full",
            !showMore && "object-cover object-top",
          )}
          height={100}
          src={imageSrc}
          unoptimized
          width={1280}
        />
      </div>
      {children}
    </div>
  );
}
