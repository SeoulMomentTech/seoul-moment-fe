import { ArrowRight } from "lucide-react";

import { cn } from "@shared/lib/style";
import { Card } from "@shared/ui/card";

interface PartnerCardProps {
  className?: string;
  imageClassName?: string;
  textColor?: string;
  title: string;
  subTitle: string;
  imageUrl: string;
}

export default function PartnerCard({
  className,
  imageClassName,
  textColor = "black",
  title,
  subTitle,
  imageUrl,
}: PartnerCardProps) {
  return (
    <Card
      className={cn(
        "h-[365px] flex-1 justify-between gap-[20px]",
        "max-sm:h-[390px] max-sm:w-full",
        className,
      )}
      contentWrapperClassName="gap-[20px]"
      extraInfo={
        <div className="max-sm:text-body-3 inline-flex w-fit gap-[4px] border-b">
          More
          <ArrowRight height={16} width={16} />
        </div>
      }
      image={
        <div
          className={cn(
            "h-[200px] w-full bg-slate-300 max-sm:h-[221px]",
            imageClassName,
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      }
      subTitle={
        <p
          className={cn(
            "max-sm:text-[13px]",
            textColor === "white" && "text-white",
          )}
        >
          {subTitle}
        </p>
      }
      title={
        <div
          className={cn(
            "flex flex-col gap-[20px]",
            textColor === "white" && "text-white",
          )}
        >
          <h4 className={cn("text-[18px] font-semibold", "max-sm:text-[16px]")}>
            {title}
          </h4>
        </div>
      }
    />
  );
}
