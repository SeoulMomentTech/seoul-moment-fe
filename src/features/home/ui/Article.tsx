"use client";

import { cn } from "@/shared/lib/style";
import { ArticleList } from "@/widgets/article-list";
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
        </div>
      }
    >
      <ArticleList />
      <ArticleSlide />
    </SectionWithLabel>
  );
}
