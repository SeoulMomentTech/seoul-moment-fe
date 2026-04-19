"use client";

import { use } from "react";

import { FileTextIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { Article, getArticleList } from "@shared/services/article";

import { Skeleton } from "@seoul-moment/ui";
import { ArticleList } from "@widgets/article-list";
import { ArticleSlide } from "@widgets/article-slide";
import { Empty } from "@widgets/empty";
import { SectionWithLabel } from "@widgets/section-with-label";

interface ArticleProps {
  promise: ReturnType<typeof getArticleList>;
}

export function Article({ promise }: ArticleProps) {
  const res = use(promise);
  const list = res.data.list;

  return (
    <SectionWithLabel
      className="w-7xl pt-[100px] max-sm:w-full max-sm:px-5"
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-5",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>Article</b>
          </h3>
        </div>
      }
    >
      <ArticleContents data={list} />
    </SectionWithLabel>
  );
}

interface ArticleContentsProps {
  data: Article[];
}

export function ArticleContents({ data }: ArticleContentsProps) {
  const t = useTranslations();
  const isEmpty = data.length === 0;

  return (
    <>
      {isEmpty ? (
        <Empty
          className="h-[360px] w-full max-sm:h-60"
          description={t("no_article_found")}
          icon={
            <FileTextIcon
              className="text-black/30"
              height={24}
              role="img"
              width={24}
            />
          }
        />
      ) : (
        <>
          <ArticleList data={data} />
          <ArticleSlide data={data} />
        </>
      )}
    </>
  );
}

export function ArticleSkeleton() {
  return (
    <SectionWithLabel
      className="w-7xl pt-[100px] max-sm:w-full max-sm:px-5"
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-5",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>Article</b>
          </h3>
        </div>
      }
    >
      <div className="flex gap-10 max-sm:hidden">
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
      </div>
      <div className="hidden max-sm:block">
        <ArticleCardSkeleton isMobile />
      </div>
    </SectionWithLabel>
  );
}

interface ArticleCardSkeletonProps {
  isMobile?: boolean;
}

function ArticleCardSkeleton({ isMobile }: ArticleCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-[500px] w-[625px] flex-col gap-4",
        "max-sm:h-[403px] max-sm:w-full",
        isMobile && "h-[403px] w-full",
      )}
    >
      <Skeleton
        className={cn("h-[460px] w-full", "max-sm:h-80", isMobile && "h-80")}
      />
      <Skeleton
        className={cn("h-[22px] w-[320px]", "max-sm:h-5 max-sm:w-60")}
      />
      <Skeleton
        className={cn("h-4 w-[420px]", "max-sm:h-3.5 max-sm:w-[260px]")}
      />
      <div className="flex gap-3">
        <Skeleton className="h-3.5 w-[120px]" />
      </div>
    </div>
  );
}
