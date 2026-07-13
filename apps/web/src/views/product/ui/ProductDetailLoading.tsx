import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

export default function ProductDetailLoading() {
  return (
    <div
      className={cn(
        "px-[20px] pb-[100px] pt-[106px]",
        "max-sm:px-0 max-sm:pb-0 max-sm:pt-[56px]",
      )}
    >
      <section className={cn("mx-auto w-[1200px]", "max-sm:w-full")}>
        <div
          className={cn(
            "flex gap-[80px] border-b border-b-black/10 pb-[50px]",
            "max-sm:flex-col max-sm:gap-[30px] max-sm:border-b-transparent max-sm:pb-0",
          )}
        >
          {/* 갤러리 */}
          <Skeleton
            className={cn(
              "h-[560px] w-[560px] shrink-0",
              "max-sm:h-[375px] max-sm:w-full",
            )}
          />
          {/* 상품 정보 */}
          <div className="flex w-full flex-col max-sm:px-[20px]">
            <Skeleton className="mb-[20px] h-[36px] w-[70%] max-sm:h-[24px]" />
            <div className="flex items-center justify-between py-[10px]">
              <div className="flex items-center gap-[10px]">
                <Skeleton className="h-[40px] w-[40px] rounded-full" />
                <Skeleton className="h-[20px] w-[120px]" />
              </div>
              <Skeleton className="h-[20px] w-[50px]" />
            </div>
            <div
              className={cn(
                "flex flex-col gap-[30px] border-b border-b-black/10 pb-[20px] pt-[10px]",
                "max-sm:gap-[20px]",
              )}
            >
              <Skeleton className="h-[20px] w-[160px]" />
              <div className="flex flex-col gap-[20px]">
                <Skeleton className="h-[20px] w-[200px]" />
                <Skeleton className="h-[28px] w-[180px]" />
              </div>
            </div>
            <div
              className={cn(
                "flex flex-col gap-[20px] pb-[50px] pt-[20px]",
                "max-sm:gap-[16px] max-sm:pb-[16px]",
              )}
            >
              <Skeleton className="h-[20px] w-[240px]" />
              <Skeleton className="h-[20px] w-[220px]" />
              <Skeleton className="h-[20px] w-[200px]" />
            </div>
          </div>
        </div>
        {/* 상세 이미지 */}
        <Skeleton
          className={cn(
            "mt-[50px] h-[800px] w-full",
            "max-sm:mt-[30px] max-sm:h-[400px]",
          )}
        />
      </section>
    </div>
  );
}
