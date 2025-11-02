"use client";

import { Link } from "@/i18n/navigation";

import { useNews } from "@entities/news/model/hooks";
import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@entities/news/ui";
import { cn } from "@shared/lib/style";
import { Skeleton } from "@shared/ui/skeleton";

import { SectionWithLabel } from "@widgets/section-with-label";

export function News() {
  const { data } = useNews({ count: 3 });

  // Mock data - in a real app this would come from an API
  const featuredNews = data[0];

  const newsItems = data.slice(1).map((news) => ({
    id: news.id,
    title: news.title,
    subTitle: news.content,
    imageUrl: news.image,
    date: news.createDate,
    author: news.writer,
  }));

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
          <h3 className="text-[32px] max-sm:text-[20px]">
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
        <Link href={`/news/${featuredNews.id}`}>
          <FeaturedMainNewsCard
            author={featuredNews.writer}
            date={featuredNews.createDate}
            imageUrl={featuredNews.image}
            subTitle={featuredNews.content}
            title={featuredNews.title}
          />
        </Link>
        {newsItems.length > 0 && (
          <>
            <div className="flex justify-start max-sm:justify-end">
              <Link href={`/news/${newsItems[0].id}`}>
                <FeaturedSubNewsCard {...newsItems[0]} />
              </Link>
            </div>
            <div>
              <Link href={`/news/${newsItems[1].id}`}>
                <FeaturedSubNewsCard {...newsItems[1]} />
              </Link>
            </div>
          </>
        )}
      </div>
    </SectionWithLabel>
  );
}

export function NewsSkeleton() {
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
          <h3 className="text-[32px] max-sm:text-[20px]">
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
          <div className="absolute right-0 bottom-0 left-0 px-[30px] pb-[50px]">
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
