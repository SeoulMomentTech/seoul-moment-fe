import type { ReactNode } from "react";

import { cn } from "@shared/lib/style";

interface CardProps {
  image?: ReactNode;
  title: string | ReactNode;
  subTitle?: string | ReactNode;
  extraInfo?: string | ReactNode;
  className?: string;
  contentWrapperClassName?: string;
}

export function Card({
  className,
  image,
  title,
  subTitle,
  extraInfo,
  contentWrapperClassName,
}: CardProps) {
  return (
    <div className={cn("flex flex-col gap-[30px]", className)}>
      {image}
      <div className={cn("flex flex-col gap-[30px]", contentWrapperClassName)}>
        <div
          className={cn(
            "flex flex-col gap-[10px]",
            "max-sm:h-full max-sm:justify-between",
          )}
        >
          {title}
          {subTitle}
        </div>
        {extraInfo}
      </div>
    </div>
  );
}
