import { ArrowRight } from "lucide-react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import { Card } from "@shared/ui/card";

interface PartnerCardProps {
  className?: string;
  imageClassName?: string;
  textColor?: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  link?: string;
}

export default function PartnerCard({
  className,
  imageClassName,
  textColor = "black",
  title,
  subTitle,
  imageUrl,
  link,
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
        <a
          className={cn(
            "max-sm:text-body-3 inline-flex w-fit items-center gap-[4px] border-b",
            !link && "hidden",
          )}
          href={link}
          rel="noreferrer"
          target="_blank"
        >
          More
          <ArrowRight height={16} width={16} />
        </a>
      }
      image={
        <div
          className={cn(
            "h-[240px] w-full bg-slate-300 max-sm:h-[220px]",
            imageClassName,
          )}
        >
          <Image
            alt=""
            className="h-[inherit] w-full object-fill"
            height={220}
            src={imageUrl}
            unoptimized
            width={400}
          />
        </div>
      }
      subTitle={
        <p
          className={cn(
            "max-sm:text-body-4",
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
          <h4 className={cn("text-body-1 font-semibold", "max-sm:text-body-2")}>
            {title}
          </h4>
        </div>
      }
    />
  );
}
