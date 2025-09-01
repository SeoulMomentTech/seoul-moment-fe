import { ArticleCard } from "@/entities/article";
import { cn } from "@/shared/lib/style";

interface ArticleListProps {
  className?: string;
}

export default function ArticleList({ className }: ArticleListProps) {
  return (
    <div className={cn("flex flex-wrap gap-[40px] max-sm:hidden", className)}>
      <ArticleCard />
      <ArticleCard />
    </div>
  );
}
