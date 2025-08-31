import type { ReactNode } from "react";
import { cn } from "@/shared/lib/style";

interface CardProps {
  image: ReactNode;
  title: string | ReactNode;
  subTitle?: string | ReactNode;
  extraInfo?: string | ReactNode;
  className?: string;
}

export function Card({
  className,
  image,
  title,
  subTitle,
  extraInfo,
}: CardProps) {
  return (
    <div className={cn("flex flex-col gap-[30px]", className)}>
      {image}
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-[10px]">
          {title}
          {subTitle}
        </div>
        {extraInfo}
      </div>
    </div>
  );
}
