"use client";

import { use, useId } from "react";

import { ArrowRightIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import type { getHome } from "@shared/services/home";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

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
        "w-7xl mx-auto flex justify-between py-[140px]",
        "max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-10 max-sm:px-5 max-sm:py-[90px]",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-[90px]",
          "max-sm:ml-0 max-sm:gap-[30px]",
        )}
      >
        <div className="flex flex-col gap-5">
          <h3
            className={cn("text-title-2 font-semibold", "max-sm:text-title-4")}
          >
            {title}
          </h3>
          <span className="max-sm:text-body-3">{description}</span>
        </div>
        <Link
          className={cn("text-body-3 flex items-center", "max-sm:text-body-4")}
          href={`/promotion/${promotionId}`}
        >
          <div className="inline-flex gap-1 border-b">
            Product detail
            <ArrowRightIcon height={16} width={16} />
          </div>
        </Link>
      </div>
      <div
        className={cn(
          "flex h-[590px] gap-[30px]",
          "max-sm:h-[199px] max-sm:gap-4",
        )}
      >
        {imageUrl && (
          <figure
            className={cn(
              "w-[708px] bg-gray-300",
              "max-sm:w-auto max-sm:flex-1",
            )}
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
        "w-7xl mx-auto flex justify-between py-[140px]",
        "max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-10 max-sm:px-5 max-sm:py-[90px]",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-[90px]",
          "max-sm:ml-0 max-sm:gap-[30px]",
        )}
      >
        <div className="flex flex-col gap-5">
          <Skeleton
            className={cn("h-8 w-[280px]", "max-sm:h-5 max-sm:w-[180px]")}
          />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[18px] w-[360px] max-sm:w-full" />
            <Skeleton className="h-[18px] w-[320px] max-sm:hidden" />
          </div>
        </div>
        <Skeleton
          className={cn("h-5 w-[150px]", "max-sm:h-[18px] max-sm:w-[140px]")}
        />
      </div>
      <div
        className={cn(
          "flex h-[590px] gap-[30px]",
          "max-sm:h-[199px] max-sm:gap-4",
        )}
      >
        <Skeleton
          className={cn("h-full w-[708px]", "max-sm:w-auto max-sm:flex-1")}
        />
      </div>
    </section>
  );
}
