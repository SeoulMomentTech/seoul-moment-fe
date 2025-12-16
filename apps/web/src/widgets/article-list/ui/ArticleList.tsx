"use client";

import { cn } from "@shared/lib/style";
import type { Article } from "@shared/services/article";

import { Link } from "@/i18n/navigation";

import { ArticleCard } from "@entities/article";

interface ArticleListProps {
  className?: string;
  data: Article[];
}

export default function ArticleList({ className, data }: ArticleListProps) {
  return (
    <div className={cn("flex gap-[30px] max-sm:hidden", className)}>
      {data.map((article) => (
        <Link href={`/article/${article.id}`} key={article.id}>
          <ArticleCard
            author={article.writer}
            className="w-[407px] flex-none"
            date={article.createDate}
            imageUrl={article.image}
            subTitle={article.content}
            title={article.title}
          />
        </Link>
      ))}
    </div>
  );
}
