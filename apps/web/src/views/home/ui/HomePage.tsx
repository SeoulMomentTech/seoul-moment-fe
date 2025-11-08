import { Skeleton } from "@seoul-moment/ui";
import { Suspense } from "react";
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
import { cn } from "@shared/lib/style";

export function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <Skeleton
            className={cn(
              "h-[600px] min-w-[1280px] pt-[56px]",
              "max-sm:h-[350px] max-sm:min-w-full",
            )}
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
