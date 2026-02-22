import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { LastNews } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import { MegazineSlide } from "@widgets/megazine-slide";
import { MoreMagazineList } from "@widgets/more-magazine";
import { SectionWithLabel } from "@widgets/section-with-label";

import { RelatedEmpty } from "./RelatedEmpty";

interface RelatedListProps {
  lastNews: LastNews[];
  type: "news" | "article";
}

export function RelatedList({ lastNews, type }: RelatedListProps) {
  const t = useTranslations();
  const isEmpty = lastNews.length === 0;

  return (
    <div
      className={cn("mx-auto min-w-[1280px] bg-black/5", "max-sm:min-w-auto")}
    >
      <SectionWithLabel
        className={cn(
          "mx-auto w-[1280px] py-[100px]",
          "max-sm:w-full max-sm:px-[20px] max-sm:py-[50px]",
        )}
        label={
          <div className="mb-[30px] flex w-full items-end justify-between max-sm:mb-[20px]">
            <h3 className="text-title-2 max-sm:text-title-4">
              <b>{t("explore_more_content")}</b>
            </h3>
            {!isEmpty && (
              <Link
                className="text-body-3 max-sm:text-body-4 hover:underline"
                href="/"
              >
                More
              </Link>
            )}
          </div>
        }
      >
        {isEmpty ? (
          <RelatedEmpty type={type} />
        ) : (
          <>
            <MoreMagazineList magazines={lastNews} type={type} />
            <MegazineSlide magazines={lastNews} type={type} />
          </>
        )}
      </SectionWithLabel>
    </div>
  );
}
