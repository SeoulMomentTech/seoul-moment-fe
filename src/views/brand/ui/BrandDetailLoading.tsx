import { cn } from "@/shared/lib/style";
import { Skeleton } from "@/shared/ui/skeleton";

export default function BrandDetailLoading() {
  return (
    <div>
      <section
        className={cn(
          "mx-auto h-[856px] max-w-[1928px] min-w-[1280px] pt-[56px] max-sm:h-[456px]",
          "max-sm:max-w-none max-sm:min-w-auto",
        )}
      >
        <Skeleton className="h-full w-full" />
      </section>
      <article
        className={cn(
          "mx-auto w-[1280px] pt-[100px]",
          "max-sm:w-full max-sm:pt-[90px]",
        )}
      >
        <div
          className={cn(
            "flex gap-[128px] pb-[100px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:pb-[90px]",
          )}
        >
          <div
            className={cn(
              "flex min-w-[522px] flex-col gap-[30px] font-semibold",
              "max-sm:min-w-full max-sm:gap-[20px] max-sm:px-[20px]",
            )}
          >
            <Skeleton className="h-[40px] w-[500px] max-sm:w-full" />
            <Skeleton className="h-[60px] w-[380px] max-sm:w-full" />
          </div>
          <div
            className={cn(
              "flex flex-col gap-[60px]",
              "max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px]",
            )}
          >
            <div
              className={cn("flex flex-col gap-[30px]", "max-sm:gap-[20px]")}
            >
              <Skeleton className="h-[22px]" />
              <Skeleton className="h-[220px]" />
            </div>
            <div
              className={cn(
                "flex gap-[20px]",
                "max-sm:flex-col max-sm:gap-[40px]",
              )}
            >
              <div className="flex max-sm:justify-start">
                <Skeleton
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
              <div className="flex max-sm:justify-end">
                <Skeleton
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex gap-[65px] pb-[140px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[90px]",
          )}
        >
          <div
            className={cn(
              "h-[640px] min-w-[585px] bg-slate-300",
              "max-sm:h-[400px] max-sm:min-w-full",
            )}
          >
            <Skeleton className="" />
          </div>

          <div className="flex flex-col justify-end gap-[20px]">
            <Skeleton className="h-[45px]" />
            <Skeleton className="h-[240px]" />
          </div>
        </div>
      </article>
      <Skeleton
        className={cn(
          "mx-auto h-[800px] min-h-[800px] max-w-[1928px] min-w-[1280px]",
          "max-sm:h-[240px] max-sm:min-h-[240px] max-sm:max-w-none max-sm:min-w-auto",
        )}
      />
      <article
        className={cn(
          "mx-auto flex w-[1280px] flex-col gap-[60px] pt-[140px] pb-[100px]",
          "max-sm:w-full max-sm:gap-[40px] max-sm:px-[20px] max-sm:pt-[90px] max-sm:pb-[50px]",
        )}
      >
        <Skeleton className="h-[60px] w-[350px] max-sm:w-[350px]" />

        <div className="flex items-center justify-center">
          <Skeleton
            className={cn(
              "h-[600px] w-[846px]",
              "max-sm:h-[244px] max-sm:w-full",
            )}
          />
        </div>
        <Skeleton className="h-[40px] w-full max-sm:h-[60px]" />
      </article>
    </div>
  );
}
