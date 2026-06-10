import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import { NewsCard } from "@entities/news";

interface NewsUpdateProps {
  news: News[];
}

export function NewsUpdate({ news }: NewsUpdateProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-[30px]", "max-sm:px-[20px]")}>
      <h2 className="text-title-2 max-sm:text-title-4 font-bold">
        News Update
      </h2>
      <div
        className={cn(
          "h-ful flex h-[428px] w-full flex-1 flex-col gap-[20px] overflow-auto",
          "scrollbar-thin scrollbar-color-transparent",
        )}
      >
        {news.map((item) => (
          <Link href={`/news/${item.id}`} key={item.id}>
            <NewsCard
              category={item.writer}
              imageUrl={item.homeImage}
              title={item.title}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
