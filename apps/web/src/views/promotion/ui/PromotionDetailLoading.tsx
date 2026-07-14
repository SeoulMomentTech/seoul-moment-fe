import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

export default function PromotionDetailLoading() {
  return (
    <div>
      {/* MainBanner */}
      <section
        className={cn(
          "min-w-7xl h-[556px] pt-14",
          "max-sm:h-[656px] max-sm:min-w-full",
        )}
      >
        <Skeleton className="h-full w-full" />
      </section>

      {/* BrandTab */}
      <nav className="border-b border-black/10 bg-white">
        <div
          className={cn(
            "w-7xl mx-auto flex items-center gap-[50px] py-5",
            "no-scrollbar max-sm:w-full max-sm:justify-start max-sm:gap-5 max-sm:overflow-x-auto max-sm:px-5",
          )}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              className="flex shrink-0 flex-col items-center gap-4"
              key={`brand-tab-${idx + 1}`}
            >
              <Skeleton className="size-[50px] rounded-full max-sm:size-10" />
              <Skeleton className="h-[14px] w-[60px]" />
            </div>
          ))}
        </div>
      </nav>

      {/* BrandIntroduction */}
      <section className={cn("w-7xl mx-auto bg-white py-10", "max-sm:w-full")}>
        <div className={cn("flex items-center gap-5", "max-sm:px-5")}>
          <Skeleton className="size-[80px] shrink-0 rounded-full max-sm:size-[60px]" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[28px] w-[200px] max-sm:h-[22px]" />
            <Skeleton className="h-[20px] w-[120px]" />
          </div>
        </div>
        <div
          className={cn("mt-10 flex flex-col gap-4", "max-sm:mt-6 max-sm:px-5")}
        >
          <Skeleton className="h-[20px] w-full" />
          <Skeleton className="h-[20px] w-[90%]" />
          <Skeleton className="h-[20px] w-[80%]" />
        </div>
      </section>

      {/* BrandLookbook */}
      <section
        className={cn("w-7xl mx-auto py-10", "max-sm:w-full max-sm:px-5")}
      >
        <div
          className={cn(
            "grid grid-cols-2 gap-5",
            "max-sm:grid-cols-1 max-sm:gap-4",
          )}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              className="h-[400px] w-full max-sm:h-[300px]"
              key={`lookbook-${idx + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
