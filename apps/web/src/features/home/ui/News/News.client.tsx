"use client";

import { use } from "react";

import { NewspaperIcon } from "lucide-react";

import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@entities/news/ui";
import { cn } from "@shared/lib/style";
import type { getNewsList, News } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import { Empty } from "@widgets/empty";
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

export interface NewsContentsProps {
  data: News[];
}

export function NewsContents({ data }: NewsContentsProps) {
  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <Empty
        className="h-[360px] w-full max-sm:h-[240px]"
        description="등록된 뉴스가 없습니다."
        icon={
          <NewspaperIcon
            className="text-black/30"
            height={24}
            role="img"
            width={24}
          />
        }
      />
    );
  }

  return (
    <div className={cn("flex gap-[40px]", "max-sm:w-full max-sm:flex-col")}>
      {data.map((news, idx) => {
        if (idx === 0) {
          return (
            <Link href={`/news/${news.id}`} key={`main-${news.id}`}>
              <FeaturedMainNewsCard
                author={news.writer}
                date={news.createDate}
                imageUrl={news.homeImage}
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
                imageUrl={news.homeImage}
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

// Removed leftover console.log(data); statement for cleaner production code
