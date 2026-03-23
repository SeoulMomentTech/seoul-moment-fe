import { Suspense } from "react";

import { getLocale } from "next-intl/server";
import { ErrorBoundary } from "react-error-boundary";

import { getHome } from "@shared/services/home";

import type { LanguageType } from "@/i18n/const";

import { cn, Skeleton } from "@seoul-moment/ui";

import { MainBanner } from "./MainBanner";
import { PromotionList, PromotionListSkeleton } from "./PromotionList";
import { SeasonCollection, SeasonCollectionSkeleton } from "./SeasonCollection";

export default async function PrimeSection() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getHome({ languageCode: locale });

  return (
    <>
      <ErrorBoundary fallback={null}>
        <Suspense
          fallback={
            <Skeleton
              className={cn(
                "min-w-7xl h-[600px] pt-14",
                "max-sm:h-[350px] max-sm:min-w-full",
              )}
            />
          }
        >
          <MainBanner promise={promise} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={<SeasonCollectionSkeleton />}>
          <SeasonCollection promise={promise} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={<PromotionListSkeleton />}>
          <PromotionList promise={promise} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
