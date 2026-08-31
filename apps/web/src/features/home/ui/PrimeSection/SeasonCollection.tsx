"use client";

import { use, useId } from "react";

import { ArrowRightIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import type { getHome } from "@shared/services/home";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";
import { splitLineBreaks } from "@/shared/lib/utils";

import { Skeleton } from "@seoul-moment/ui";

interface SeasonCollectionProps {
  promise: ReturnType<typeof getHome>;
}

export function SeasonCollection({ promise }: SeasonCollectionProps) {
  const id = useId();
  const res = use(promise);
  const promotionList = res.data?.promotion ?? [];

  if (!promotionList || promotionList.length === 0) return null;

  const { title, description, imageUrl, promotionId } = promotionList[0];

  return (
    <section
      className={cn(
        "w-7xl pt-25 mx-auto flex justify-between",
        "max-sm:pt-22.5 max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-10 max-sm:px-5",
      )}
    >
      <div
        className={cn(
          "gap-22.5 flex flex-col justify-center",
          "max-sm:gap-7.5 max-sm:ml-0",
        )}
      >
        <div className="flex flex-col gap-5">
          <h3
            className={cn("text-title-2 font-semibold", "max-sm:text-title-4")}
          >
            {title}
          </h3>
          <div className="max-sm:text-body-3">
            {splitLineBreaks(description).map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        </div>
        <Link
          className={cn("text-body-2 flex items-center", "max-sm:text-body-4")}
          href={`/promotion/${promotionId}`}
          prefetch
        >
          <div className="inline-flex items-center gap-1 border-b">
            View detail
            <ArrowRightIcon height={16} width={16} />
          </div>
        </Link>
      </div>
      <div
        className={cn("h-147.5 gap-7.5 flex", "max-sm:h-49.75 max-sm:gap-4")}
      >
        {imageUrl && (
          <figure
            className={cn("w-177 bg-gray-300", "max-sm:w-auto max-sm:flex-1")}
          >
            <BaseImage
              alt=""
              className="h-full object-cover"
              height={600}
              key={id}
              src={imageUrl}
              width={708}
            />
          </figure>
        )}
      </div>
    </section>
  );
}

export function SeasonCollectionSkeleton() {
  return (
    <section
      className={cn(
        "w-7xl py-35 mx-auto flex justify-between",
        "max-sm:py-22.5 max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-10 max-sm:px-5",
      )}
    >
      <div
        className={cn(
          "gap-22.5 flex flex-col justify-center",
          "max-sm:gap-7.5 max-sm:ml-0",
        )}
      >
        <div className="flex flex-col gap-5">
          <Skeleton className={cn("w-70 h-8", "max-sm:w-45 max-sm:h-5")} />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4.5 w-90 max-sm:w-full" />
            <Skeleton className="h-4.5 w-[320px] max-sm:hidden" />
          </div>
        </div>
        <Skeleton className={cn("w-37.5 h-5", "max-sm:h-4.5 max-sm:w-35")} />
      </div>
      <div
        className={cn("h-147.5 gap-7.5 flex", "max-sm:h-49.75 max-sm:gap-4")}
      >
        <Skeleton
          className={cn("w-177 h-full", "max-sm:w-auto max-sm:flex-1")}
        />
      </div>
    </section>
  );
}
