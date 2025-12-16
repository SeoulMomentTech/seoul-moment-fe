"use client";

import { use } from "react";

import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@entities/news/ui";
import { cn } from "@shared/lib/style";
import type { getNewsList, News } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import { SectionWithLabel } from "@widgets/section-with-label";

interface NewsProps {
  promise: ReturnType<typeof getNewsList>;
}

export function News({ promise }: NewsProps) {
  const res = use(promise);

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
      <NewsContents data={res.data.list} />
    </SectionWithLabel>
  );
}

interface NewsContentsProps {
  data: News[];
}

function NewsContents({ data }: NewsContentsProps) {
  return (
    <div className={cn("flex gap-[40px]", "max-sm:w-full max-sm:flex-col")}>
      {data.map((news, idx) => {
        if (idx === 0) {
          return (
            <Link href={`/news/${news.id}`} key={`main-${news.id}`}>
              <FeaturedMainNewsCard
                author={news.writer}
                date={news.createDate}
                imageUrl={news.image}
                subTitle={news.content}
                title={news.title}
              />
            </Link>
          );
        }

        return (
          <div
            className={cn(idx === 1 && "flex justify-start max-sm:justify-end")}
            key={`sub-${news.id}`}
          >
            <Link href={`/news/${news.id}`}>
              <FeaturedSubNewsCard
                author={news.writer}
                date={news.createDate}
                imageUrl={news.image}
                subTitle={news.content}
                title={news.title}
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
