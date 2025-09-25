"use client";

import { ArticleCard } from "@/entities/article";
import useArticle from "@/shared/lib/hooks/useArticle";
import { cn } from "@/shared/lib/style";

interface ArticleListProps {
  className?: string;
}

export default function ArticleList({ className }: ArticleListProps) {
  const { data } = useArticle({ count: 2 });

  return (
    <div className={cn("flex flex-wrap gap-[40px] max-sm:hidden", className)}>
      {data.map((article) => (
        <ArticleCard
          author={article.writer}
          className="flex-none"
          date={article.createDate}
          imageUrl={article.image}
          key={article.id}
          subTitle={article.content}
          title={article.title}
        />
      ))}
    </div>
  );
}
