"use client";

import { useArticle } from "@entities/article/model/hooks";
import { useMediaQuery } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { ArticleCard } from "@entities/article";
import { Button } from "@seoul-moment/ui";

export default function NewsList() {
  const { data: articles } = useArticle({ count: 4 });
  const isMobile = useMediaQuery(`(max-width: 640px)`);

  return (
    <div className="flex flex-col gap-[50px] max-sm:gap-[40px]">
      <div
        className="grid gap-x-[40px] gap-y-[50px] max-sm:gap-x-[16px] max-sm:gap-y-[40px]"
        style={{
          gridTemplateColumns: "repeat(2,1fr)",
        }}
      >
        {articles?.map((article) => (
          <Link href={`/article/${article.id}`} key={article.id}>
            <ArticleCard
              author={article.writer}
              date={article.createDate}
              imageUrl={article.homeImage}
              subTitle={article.content}
              title={article.title}
              variant={isMobile ? "small" : "default"}
            />
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          asChild
          className={cn(
            "h-auto rounded-[4px] border border-black/20 bg-white px-[20px] py-[16px] text-black",
            "cursor-pointer hover:bg-neutral-50",
            "max-sm:w-full",
          )}
          variant="outline"
        >
          <Link href="/news">더보기</Link>
        </Button>
      </div>
    </div>
  );
}
