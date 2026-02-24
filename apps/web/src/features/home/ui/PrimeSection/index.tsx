import { Suspense } from "react";

import { getLocale } from "next-intl/server";

import { getHome } from "@shared/services/home";

import type { LanguageType } from "@/i18n/const";

import { cn, Skeleton } from "@seoul-moment/ui";

import { MainBanner } from "./MainBanner";

export default async function PrimeSection() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getHome({ languageCode: locale });

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
        <MainBanner promise={promise} />
      </Suspense>
      {/* 추후 백엔드 측 작업 완료후 SeasonCollection 재추가*/}
    </>
  );
}
