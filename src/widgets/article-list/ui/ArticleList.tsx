"use client";

import { ArticleCard } from "@/entities/article";
import { Link } from "@/i18n/navigation";
import useArticle from "@/shared/lib/hooks/useArticle";
import { cn } from "@/shared/lib/style";

interface ArticleListProps {
  className?: string;
}

export default function ArticleList({ className }: ArticleListProps) {
  const { data } = useArticle({ count: 2 });

  return (
    <div className={cn("flex gap-[40px] max-sm:hidden", className)}>
      {data.map((article) => (
        <Link href={`/article/${article.id}`} key={article.id}>
          <ArticleCard
            author={article.writer}
            className="flex-none"
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
