"use client";

import { use } from "react";

import { FeaturedMainNewsCard } from "@entities/news/ui";
import { cn } from "@shared/lib/style";
import type { getNewsDashboard } from "@shared/services/news";
import LifeStyleList from "@widgets/lifestyle-list/ui/LifeStyleList";

import { Link } from "@/i18n/navigation";

import { EditorPickSlide } from "@widgets/editor-pick";
import { HotKeywordList } from "@widgets/hot-list";
import { NewsUpdate } from "@widgets/news-update";
import { SectionWithLabel } from "@widgets/section-with-label";

interface NewsPageContentProps {
  promise: ReturnType<typeof getNewsDashboard>;
}

export function NewsPageContent({ promise }: NewsPageContentProps) {
  const { data } = use(promise);
  const { recentList, editorPickList, hashtag } = data;
  const [featured, ...newsList] = recentList;

  return (
    <section>
      <section
        className={cn(
          "mx-auto mb-[100px] mt-[106px] flex h-[480px] w-[1280px] gap-[40px]",
          "max-sm:h-auto max-sm:w-full max-sm:flex-col max-sm:gap-[50px]",
          "max-sm:mt-[56px]",
        )}
      >
        {featured && (
          <Link href={`/news/${featured.id}`}>
            <FeaturedMainNewsCard
              author={featured.writer}
              category={featured.newsCategoryName}
              className={cn(
                "h-[480px] w-[738px]",
                "max-sm:h-[600px] max-sm:w-full",
              )}
              date={featured.createDate}
              imageUrl={featured.homeImage}
              subTitle={featured.content}
              title={featured.title}
            />
          </Link>
        )}
        <NewsUpdate news={newsList} />
      </section>
      {editorPickList.length > 0 && (
        <SectionWithLabel
          className={cn(
            "mx-auto mb-[103px] w-[1280px]",
            "max-sm:mb-[90px] max-sm:w-full max-sm:px-[20px]",
          )}
          label={
            <h2 className="text-title-2 max-sm:text-title-4 mb-[30px] font-bold max-sm:mb-[20px]">
              Editor’s Pick
            </h2>
          }
        >
          <EditorPickSlide items={editorPickList} />
        </SectionWithLabel>
      )}
      {hashtag.list.length > 0 && (
        <section
          className={cn(
            "mx-auto mb-[100px] h-[618px] w-full min-w-[1280px] bg-black py-[100px]",
            "max-sm:mb-[50px] max-sm:h-[511px] max-sm:min-w-full max-sm:max-w-none max-sm:flex-col",
            "max-sm:px-[20px] max-sm:py-[50px]",
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-[1280px] gap-[130px]",
              "max-sm:w-full max-sm:flex-col max-sm:gap-[40px]",
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-[30px] text-white",
                "max-sm:gap-[10px]",
              )}
            >
              <span className="max-sm:text-body-3">Hot Keyword</span>
              <h3 className="text-title-1 max-sm:text-title-3 font-bold">
                #{hashtag.name}
              </h3>
            </div>
            <div
              className={cn(
                "h-[418px] w-[951px]",
                "max-sm:h-auto max-sm:w-full max-sm:overflow-x-auto",
              )}
            >
              <HotKeywordList items={hashtag.list} />
            </div>
          </div>
        </section>
      )}
      <SectionWithLabel
        className={cn(
          "mx-auto mb-[100px] w-[1280px]",
          "max-sm:w-full max-sm:px-[20px]",
        )}
        label={
          <h2 className="text-title-2 max-sm:text-title-4 mb-[30px] font-bold max-sm:mb-[20px]">
            Lifestyle
          </h2>
        }
      >
        <LifeStyleList />
      </SectionWithLabel>
    </section>
  );
}
