import { Suspense } from "react";

import { getLocale } from "next-intl/server";

import { cn } from "@shared/lib/style";
import { getNewsDashboard } from "@shared/services/news";

import type { LanguageType } from "@/i18n/const";

import { Skeleton } from "@seoul-moment/ui";

import { NewsPageContent } from "./NewsPageContent";

export async function NewsPage() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getNewsDashboard({ languageCode: locale });

  return (
    <Suspense fallback={<NewsPageSkeleton />}>
      <NewsPageContent promise={promise} />
    </Suspense>
  );
}

function NewsPageSkeleton() {
  return (
    <section
      className={cn(
        "mx-auto mt-[106px] flex h-[480px] w-[1280px] gap-[40px]",
        "max-sm:h-auto max-sm:w-full max-sm:flex-col max-sm:gap-[50px]",
        "max-sm:mt-[56px]",
      )}
    >
      <Skeleton
        className={cn("h-[480px] w-[738px]", "max-sm:h-[600px] max-sm:w-full")}
      />
      <div
        className={cn("flex flex-1 flex-col gap-[20px]", "max-sm:px-[20px]")}
      >
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton className="h-[90px] w-full" key={`news-skeleton-${key}`} />
        ))}
      </div>
    </section>
  );
}
