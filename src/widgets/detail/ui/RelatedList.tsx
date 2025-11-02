import Link from "next/link";
import type { LastNews } from "@/shared/services/news";
import { cn } from "@shared/lib/style";
import { MegazineSlide } from "@widgets/megazine-slide";
import { MoreMagazineList } from "@widgets/more-magazine";
import { SectionWithLabel } from "@widgets/section-with-label";

interface RelatedListProps {
  lastNews: LastNews[];
  type: "news" | "article";
}

export function RelatedList({ lastNews, type }: RelatedListProps) {
  return (
    <div className={cn("mx-auto mt-[-128px] bg-black/5", "max-sm:mt-[-90px]")}>
      <SectionWithLabel
        className={cn(
          "mx-auto w-[1280px] pt-[228px] pb-[100px]",
          "max-sm:w-full max-sm:px-[20px] max-sm:pt-[180px]",
        )}
        label={
          <div className="mb-[30px] flex w-full items-end justify-between max-sm:mb-[20px]">
            <h3 className="text-[32px] max-sm:text-[20px]">
              <b>지난 매거진 보러 가기</b>
            </h3>
            <Link
              className="text-[14px] hover:underline max-sm:text-[13px]"
              href="/"
            >
              More
            </Link>
          </div>
        }
      >
        <MoreMagazineList magazines={lastNews} type={type} />
        <MegazineSlide magazines={lastNews} type={type} />
      </SectionWithLabel>
    </div>
  );
}
