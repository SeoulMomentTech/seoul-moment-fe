import { Suspense } from "react";
import { cn } from "@/shared/lib/style";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  SeasonCollection,
  SeasonCollectionSkeleton,
  NewsSkeleton,
  News,
  ArticleSkeleton,
  MainBanner,
  Article,
  ContactUS,
} from "@features/home";

export function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <Skeleton
            className={cn("h-[690px] min-w-[1280px]", "max-sm:min-w-full")}
          />
        }
      >
        <MainBanner />
      </Suspense>
      <div className="mx-auto w-[1280px] px-[20px] max-sm:w-auto max-sm:px-0">
        <Suspense fallback={<SeasonCollectionSkeleton />}>
          <SeasonCollection />
        </Suspense>
        <Suspense fallback={<NewsSkeleton />}>
          <News />
        </Suspense>
        <Suspense fallback={<ArticleSkeleton />}>
          <Article />
        </Suspense>
        <ContactUS />
      </div>
    </>
  );
}
