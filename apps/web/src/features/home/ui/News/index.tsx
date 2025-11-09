import { Skeleton } from "@seoul-moment/ui";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import type { LanguageType } from "@/i18n/const";
import { cn } from "@shared/lib/style";
import { getNewsList } from "@shared/services/news";
import { SectionWithLabel } from "@widgets/section-with-label";
import { News as NewsClient } from "./News.client";

export default async function News() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getNewsList({ count: 3, languageCode: locale });

  return (
    <Suspense fallback={<NewsSkeleton />}>
      <NewsClient promise={promise} />
    </Suspense>
  );
}

function NewsSkeleton() {
  return (
    <SectionWithLabel
      className={cn("w-[1280px] py-[100px]", "max-sm:w-full max-sm:py-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px] max-sm:px-[20px]",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>NEWS</b>
          </h3>
        </div>
      }
    >
      <div
        className={cn(
          "flex justify-between gap-[40px]",
          "max-sm:w-full max-sm:flex-col",
        )}
      >
        <div
          className={cn(
            "relative h-[596px] w-[460px]",
            "max-sm:h-[457px] max-sm:w-full",
          )}
        >
          <Skeleton className="h-full w-full" />
          <div className="absolute bottom-0 left-0 right-0 px-[30px] pb-[50px]">
            <div className="flex flex-col gap-[16px]">
              <Skeleton
                className={cn(
                  "h-[24px] w-[260px]",
                  "max-sm:h-[20px] max-sm:w-[220px]",
                )}
              />
              <Skeleton
                className={cn(
                  "h-[16px] w-[320px]",
                  "max-sm:h-[14px] max-sm:w-[240px]",
                )}
              />
              <Skeleton className={cn("h-[16px] w-[280px]", "max-sm:hidden")} />
            </div>
            <div className="mt-[20px] flex gap-[12px]">
              <Skeleton className="h-[14px] w-[140px]" />
            </div>
          </div>
        </div>
        <div className="flex justify-start max-sm:justify-end">
          <div
            className={cn(
              "flex h-[596px] w-[370px] flex-col gap-[20px]",
              "max-sm:flex max-sm:h-[435px] max-sm:w-[264px] max-sm:justify-end max-sm:px-[20px]",
            )}
          >
            <Skeleton className={cn("h-[498px] w-full", "max-sm:h-[342px]")} />
            <div className="flex flex-col gap-[12px]">
              <Skeleton className="h-[20px] w-[220px] max-sm:w-[200px]" />
              <Skeleton className="h-[16px] w-[280px] max-sm:w-[220px]" />
              <Skeleton className="h-[16px] w-[200px] max-sm:w-[180px]" />
            </div>
            <Skeleton className="h-[14px] w-[120px]" />
          </div>
        </div>
        <div>
          <div
            className={cn(
              "flex h-[596px] w-[370px] flex-col gap-[20px]",
              "max-sm:flex max-sm:h-[435px] max-sm:w-[264px] max-sm:justify-end max-sm:px-[20px]",
            )}
          >
            <Skeleton className={cn("h-[498px] w-full", "max-sm:h-[342px]")} />
            <div className="flex flex-col gap-[12px]">
              <Skeleton className="h-[20px] w-[220px] max-sm:w-[200px]" />
              <Skeleton className="h-[16px] w-[280px] max-sm:w-[220px]" />
              <Skeleton className="h-[16px] w-[200px] max-sm:w-[180px]" />
            </div>
            <Skeleton className="h-[14px] w-[120px]" />
          </div>
        </div>
      </div>
    </SectionWithLabel>
  );
}
