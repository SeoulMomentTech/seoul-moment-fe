import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

const DESKTOP_CARD_COUNT = 15;
const MOBILE_CARD_COUNT = 8;

export default function ProductListLoading() {
  return (
    <div>
      <section
        className={cn(
          "mx-auto w-[1320px] pt-[106px]",
          "max-sm:w-full max-sm:pt-[56px]",
        )}
      >
        {/* Banner */}
        <Skeleton
          className={cn("mb-10 h-[480px] w-full", "max-sm:mb-5 max-sm:h-60")}
        />

        <div className="px-[20px]">
          {/* Desktop */}
          <div
            className={cn(
              "flex flex-col gap-[40px] pb-[100px]",
              "max-sm:hidden",
            )}
          >
            {/* Category tabs + search */}
            <div className="flex items-center justify-between border-b border-black/10">
              <div className="flex h-[50px] items-center gap-[30px]">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton
                    className="h-[20px] w-[48px]"
                    key={`product-tab-${idx + 1}`}
                  />
                ))}
              </div>
              <Skeleton className="h-[42px] w-[278px]" />
            </div>

            <div className="flex gap-[20px]">
              {/* Brand filter sidebar */}
              <aside className="min-w-[197px]">
                <Skeleton className="mb-[20px] h-[28px] w-[120px]" />
                <div className="flex flex-col gap-[24px]">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton
                      className="h-[20px] w-full"
                      key={`product-brand-filter-${idx + 1}`}
                    />
                  ))}
                </div>
              </aside>

              {/* Grid section */}
              <section className="flex flex-col gap-[20px]">
                <div className="mb-[20px] flex items-center justify-end gap-[12px]">
                  <Skeleton className="h-[20px] w-[80px]" />
                  <Skeleton className="h-[20px] w-[60px]" />
                  <Skeleton className="h-[20px] w-[60px]" />
                </div>
                <div
                  className={cn(
                    "flex min-h-[687px] w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
                  )}
                >
                  {Array.from({ length: DESKTOP_CARD_COUNT }).map((_, idx) => (
                    <ProductCardSkeleton key={`product-card-${idx + 1}`} />
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Mobile */}
          <div
            className={cn(
              "hidden",
              "max-sm:flex max-sm:flex-col max-sm:gap-[20px]",
            )}
          >
            <div className="grid grid-cols-2 gap-x-[12px] gap-y-[30px]">
              {Array.from({ length: MOBILE_CARD_COUNT }).map((_, idx) => (
                <ProductCardSkeleton key={`product-card-mobile-${idx + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex h-fit w-[196px] flex-col gap-[10px] max-sm:w-full">
      <Skeleton className="h-[196px] w-[196px] max-sm:aspect-square max-sm:h-auto max-sm:w-full" />
      <Skeleton className="h-[16px] w-[70%]" />
      <Skeleton className="h-[16px] w-[90%]" />
      <Skeleton className="h-[16px] w-[40%]" />
    </div>
  );
}
