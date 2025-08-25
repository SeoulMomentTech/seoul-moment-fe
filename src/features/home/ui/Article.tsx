import ArticleCard from "@/entities/article/ui/ArticleCard";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";
import { ArticleSlide } from "@/widgets/article-slide";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function Article() {
  return (
    <SectionWithLabel
      className="w-full py-[100px] max-sm:px-[20px]"
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px]",
          )}
        >
          <h3 className="text-[32px] max-sm:text-[20px]">
            <b>Article</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <ArticleCardList />
      <ArticleSlide />
    </SectionWithLabel>
  );
}

function ArticleCardList() {
  return (
    <div className="flex flex-wrap gap-[40px] max-sm:hidden">
      <ArticleCard />
      <ArticleCard />
    </div>
  );
}
