"use client";

import { Skeleton } from "@seoul-moment/ui";
import { cn } from "@shared/lib/style";
import { ArticleList } from "@widgets/article-list";
import { ArticleSlide } from "@widgets/article-slide";
import { SectionWithLabel } from "@widgets/section-with-label";

export function Article() {
  return (
    <SectionWithLabel
      className="w-[1280px] py-[100px] max-sm:w-full max-sm:px-[20px]"
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

export function ArticleSkeleton() {
  return (
    <SectionWithLabel
      className="w-[1280px] py-[100px] max-sm:w-full max-sm:px-[20px]"
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
      <div className="flex gap-[40px] max-sm:hidden">
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
        "flex h-[500px] w-[625px] flex-col gap-[16px]",
        "max-sm:h-[403px] max-sm:w-full",
        isMobile && "h-[403px] w-full",
      )}
    >
      <Skeleton
        className={cn(
          "h-[460px] w-full",
          "max-sm:h-[320px]",
          isMobile && "h-[320px]",
        )}
      />
      <Skeleton
        className={cn("h-[22px] w-[320px]", "max-sm:h-[20px] max-sm:w-[240px]")}
      />
      <Skeleton
        className={cn("h-[16px] w-[420px]", "max-sm:h-[14px] max-sm:w-[260px]")}
      />
      <div className="flex gap-[12px]">
        <Skeleton className="h-[14px] w-[120px]" />
      </div>
    </div>
  );
}
