"use client";

import { Link } from "@/i18n/navigation";

import { cn } from "@/shared/lib/style";

import { SectionWithLabel } from "@/widgets/section-with-label";
import { useNews } from "@entities/news/model/hooks";
import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@entities/news/ui";

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
