import { Suspense } from "react";

import { getLocale } from "next-intl/server";

import { cn } from "@shared/lib/style";
import { getProductList } from "@shared/services/product";

import type { LanguageType } from "@/i18n/const";

import { Skeleton } from "@seoul-moment/ui";
import { SectionWithLabel } from "@widgets/section-with-label";

import { NowOnSale as NowOnSaleClient } from "./NowOnSale.client";

export default async function NowOnSale() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getProductList({
    page: 1,
    count: 12,
    languageCode: locale,
    mainView: true,
  });

  return (
    <Suspense fallback={<NowOnSaleSkeleton />}>
      <NowOnSaleClient promise={promise} />
    </Suspense>
  );
}

function NowOnSaleSkeleton() {
  return (
    <SectionWithLabel
      className={cn("w-[1280px] py-[100px]", "max-sm:w-full max-sm:py-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px] max-sm:px-[20px]",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>Now On Sale</b>
          </h3>
        </div>
      }
    >
      <div
        className={cn(
          "grid grid-cols-4 gap-x-[20px] gap-y-[40px]",
          "max-sm:scrollbar-hide max-sm:flex max-sm:gap-[16px] max-sm:overflow-x-auto max-sm:px-[20px]",
        )}
      >
        {["1", "2", "3", "4"].map((key) => (
          <div className="flex flex-col gap-[10px]" key={`skeleton-${key}`}>
            <Skeleton
              className={cn(
                "h-[305px] w-[305px]",
                "max-sm:h-[208px] max-sm:w-[208px]",
              )}
            />
            <div className="flex flex-col gap-[8px]">
              <Skeleton className="h-[20px] w-[120px]" />
              <Skeleton className="h-[18px] w-[200px]" />
            </div>
            <Skeleton className="h-[18px] w-[100px]" />
          </div>
        ))}
      </div>
    </SectionWithLabel>
  );
}
