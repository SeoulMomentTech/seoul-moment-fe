"use client";

import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@shared/lib/style";
import { Skeleton } from "@shared/ui/skeleton";
import useHome from "../model/useHome";

export function SeasonCollection() {
  const id = useId();
  const {
    data: { section = [] },
  } = useHome();

  if (!section || section.length === 0) return null;

  return (
    <section
      className={cn(
        "mx-auto flex w-[1280px] justify-between py-[140px]",
        "max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px] max-sm:py-[90px]",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-[90px]",
          "max-sm:ml-0 max-sm:gap-[30px]",
        )}
      >
        <div className="flex flex-col gap-[20px]">
          <h3 className={cn("text-[32px] font-semibold", "max-sm:text-[20px]")}>
            {section?.[0]?.title}
          </h3>
          <span className="max-sm:text-[14px]">
            {section?.[0]?.description}
          </span>
        </div>
        <Link
          className={cn("flex items-center text-[14px]", "max-sm:text-[13px]")}
          href="/product"
        >
          <div className="inline-flex gap-[4px] border-b">
            Product detail
            <ArrowRightIcon height={16} width={16} />
          </div>
        </Link>
      </div>
      <div
        className={cn(
          "flex h-[590px] gap-[30px]",
          "max-sm:h-[199px] max-sm:gap-[16px]",
        )}
      >
        {section[0]?.image?.map((src, idx) => (
          <figure
            className={cn(
              "w-[354px] bg-gray-300",
              "max-sm:w-auto max-sm:flex-1",
            )}
            key={`${id}-${src}-${idx + 1}`}
          >
            <Image
              alt=""
              className="h-full object-cover"
              height={600}
              src={src}
              width={360}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

export function SeasonCollectionSkeleton() {
  return (
    <section
      className={cn(
        "mx-auto flex w-[1280px] justify-between py-[140px]",
        "max-sm:w-auto max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px] max-sm:py-[90px]",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-[90px]",
          "max-sm:ml-0 max-sm:gap-[30px]",
        )}
      >
        <div className="flex flex-col gap-[20px]">
          <Skeleton
            className={cn(
              "h-[32px] w-[280px]",
              "max-sm:h-[20px] max-sm:w-[180px]",
            )}
          />
          <div className="flex flex-col gap-[12px]">
            <Skeleton className="h-[18px] w-[360px] max-sm:w-full" />
            <Skeleton className="h-[18px] w-[320px] max-sm:hidden" />
          </div>
        </div>
        <Skeleton
          className={cn(
            "h-[20px] w-[150px]",
            "max-sm:h-[18px] max-sm:w-[140px]",
          )}
        />
      </div>
      <div
        className={cn(
          "flex h-[590px] gap-[30px]",
          "max-sm:h-[199px] max-sm:gap-[16px]",
        )}
      >
        <Skeleton
          className={cn("h-full w-[354px]", "max-sm:w-auto max-sm:flex-1")}
        />
        <Skeleton
          className={cn("h-full w-[354px]", "max-sm:w-auto max-sm:flex-1")}
        />
      </div>
    </section>
  );
}
