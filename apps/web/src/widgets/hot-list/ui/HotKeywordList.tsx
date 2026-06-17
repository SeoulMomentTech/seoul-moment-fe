import StyleCard from "@entities/article/ui/StyleCard";
import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

interface HotKeywordListProps {
  className?: string;
  items: News[];
}

export default function HotKeywordList({
  className,
  items,
}: HotKeywordListProps) {
  return (
    <div
      className={cn(
        "flex gap-[30px] max-sm:w-full max-sm:gap-[16px]",
        className,
      )}
    >
      {items.map((item) => (
        <StyleCard
          author={item.writer}
          category={item.newsCategoryName}
          className="h-[418px] max-sm:h-[323px] max-sm:min-w-[208px]"
          date={item.createDate}
          imageClassName="h-[297px] max-sm:h-[208px]"
          imageUrl={item.homeImage}
          key={`hot-${item.id}`}
          subTitle={item.content}
          textColor="white"
          title={item.title}
        />
      ))}
    </div>
  );
}
